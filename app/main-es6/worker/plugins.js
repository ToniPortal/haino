/* global process */
'use strict';

const _ = require('lodash');

const schemaDefaults = require('../../utils/schema-defaults');

const matchutil = require('../utils/matchutil');
const textutil = require('../utils/textutil');
const prefStore = require('./pref-store');
const ObservableObject = require('../common/observable-object');
const storages = require('./storages');

const conf = require('../conf');

function createSanitizeSearchResultFunc(pluginId, pluginConfig) {
  return (x) => {
    const defaultScore = 0.5;
    const _icon = x.icon;
    const _score = Math.max(0, Math.min(x.score || defaultScore, 1)); // clamp01(x.score)
    const _title = textutil.sanitize(x.title);
    const _desc = textutil.sanitize(x.desc);
    const _group = x.group;
    const sanitizedProps = {
      pluginId: pluginId,
      title: _title,
      desc: _desc,
      score: _score,
      icon: _icon || pluginConfig.icon,
      group: _group || pluginConfig.group
    };
    return _.assign(x, sanitizedProps);
  };
}

function createResponseObject(resFunc, pluginId, pluginConfig) {
  const sanitizeSearchResult = createSanitizeSearchResultFunc(pluginId, pluginConfig);
  return {
    add: (result) => {
      let searchResults = [];
      if (_.isArray(result)) {
        searchResults = result.map(sanitizeSearchResult);
      } else if (_.isPlainObject(result)) {
        searchResults = [sanitizeSearchResult(result)];
      } else {
        throw new Error('argument must be an array or an object');
      }
      if (searchResults.length <= 0)
        return;
      resFunc({
        type: 'add',
        payload: searchResults
      });
    },
    remove: (id) => {
      resFunc({
        type: 'remove',
        payload: { id, pluginId }
      });
    }
  };
}

function _makeIntroHelp(pluginConfig) {
  const usage = pluginConfig.usage || 'please fill usage in package.json';
  return [{
    redirect: pluginConfig.redirect || pluginConfig.prefix,
    title: textutil.sanitize(usage),
    desc: textutil.sanitize(pluginConfig.name),
    icon: pluginConfig.icon,
    group: 'Plugins',
    score: Math.random()
  }];
}

function _makePrefixHelp(pluginConfig, query) {
  if (!pluginConfig.prefix) return;
  const candidates = [pluginConfig.prefix];
  const filtered = matchutil.head(candidates, query, (x) => x);
  return filtered.map((x) => {
    return {
      redirect: pluginConfig.redirect || pluginConfig.prefix,
      title: textutil.sanitize(matchutil.makeStringBoldHtml(x.elem, x.matches)),
      desc: textutil.sanitize(pluginConfig.name),
      group: 'Plugin Commands',
      icon: pluginConfig.icon
    };
  });
}

module.exports = (workerContext) => {
  const pluginLoader = require('./plugin-loader')(workerContext);
  const logger = workerContext.logger;

  let plugins = null;
  let pluginConfigs = null;
  let pluginPrefIds = null;

  const pluginContextBase = {
    PLUGIN_API_VERSION: 'hain0',
    MAIN_PLUGIN_REPO: conf.MAIN_PLUGIN_REPO,
    DEV_PLUGIN_REPO: conf.DEV_PLUGIN_REPO,
    INTERNAL_PLUGIN_REPO: conf.INTERNAL_PLUGIN_REPO,
    app: workerContext.app,
    toast: workerContext.toast,
    shell: workerContext.shell,
    logger: workerContext.logger,
    httpAgent: workerContext.httpAgent,
    globalPreferences: workerContext.globalPreferences,
    matchutil
  };

  function generatePluginContext(pluginId, pluginConfig) {
    const localStorage = storages.createPluginLocalStorage(pluginId);
    let preferences = undefined;

    const hasPreferences = (pluginConfig.prefSchema !== null);
    if (hasPreferences) {
      const defaults = schemaDefaults(pluginConfig.prefSchema);
      const saved = prefStore.get(pluginId) || {};
      prefStore.set(pluginId, _.assign(defaults, saved));

      const initialPref = prefStore.get(pluginId);
      preferences = new ObservableObject(initialPref);
    }
    return _.assign({}, pluginContextBase, { localStorage, preferences });
  }

  function _startup() {
    logger.log('startup: begin');
    for (const prop in plugins) {
      logger.log(`startup: ${prop}`);
      const startupFunc = plugins[prop].startup;
      if (!_.isFunction(startupFunc)) {
        logger.log(`${prop}: startup property should be a Function`);
        continue;
      }
      try {
        startupFunc();
      } catch (e) {
        logger.log(e);
        if (e.stack)
          logger.log(e.stack);
      }
    }
    logger.log('startup: end');
  }

  function initialize() {
    const ret = pluginLoader.loadPlugins(generatePluginContext);
    plugins = ret.plugins;
    pluginConfigs = ret.pluginConfigs;
    pluginPrefIds = _.reject(_.keys(pluginConfigs), x => pluginConfigs[x].prefSchema === null);

    _startup();
  }

  function searchAll(query, res) {
    for (const prop in plugins) {
      const pluginId = prop;
      const plugin = plugins[pluginId];
      const pluginConfig = pluginConfigs[pluginId];

      const sysResponse = createResponseObject(res, '*', pluginConfig);
      if (query.length === 0) {
        const help = _makeIntroHelp(pluginConfig);
        if (help && help.length > 0) {
          sysResponse.add(help);
        }
        continue;
      }

      let _query = query;
      const _query_lower = query.toLowerCase();
      const _prefix = pluginConfig.prefix;

      if (_prefix /* != null || != undefined */) {
        const prefix_lower = _prefix.toLowerCase();
        if (_query_lower.startsWith(prefix_lower) === false) {
          const prefixHelp = _makePrefixHelp(pluginConfig, query);
          if (prefixHelp && prefixHelp.length > 0) {
            sysResponse.add(prefixHelp);
          }
          continue;
        }
        _query = _query.substring(_prefix.length);
      }

      const pluginResponse = createResponseObject(res, pluginId, pluginConfig);
      try {
        plugin.search(_query, pluginResponse);
      } catch (e) {
        logger.log(e);
        if (e.stack)
          logger.log(e.stack);
      }
    }
  }

  function execute(pluginId, id, payload) {
    if (plugins[pluginId] === undefined)
      return;
    const executeFunc = plugins[pluginId].execute;
    if (executeFunc === undefined)
      return;
    try {
      executeFunc(id, payload);
    } catch (e) {
      logger.log(e);
      if (e.stack)
        logger.log(e.stack);
    }
  }

  function getPrefIds() {
    return pluginPrefIds;
  }

  let tempPrefs = {};
  function getPreferences(prefId) {
    const prefSchema = pluginConfigs[prefId].prefSchema;
    const tempPref = tempPrefs[prefId];
    return {
      prefId,
      schema: JSON.stringify(prefSchema),
      model: tempPref || prefStore.get(prefId)
    };
  }

  function updatePreferences(prefId, prefModel) {
    tempPrefs[prefId] = prefModel;
  }

  function commitPreferences() {
    for (const prefId in tempPrefs) {
      const prefModel = tempPrefs[prefId];
      const pluginInstance = plugins[prefId];
      const pluginContext = pluginInstance.__pluginContext;

      pluginContext.preferences.update(prefModel);
      prefStore.set(prefId, prefModel);
    }
    tempPrefs = {};
  }

  function resetPreferences(prefId) {
    const prefSchema = pluginConfigs[prefId].prefSchema;
    const pref = schemaDefaults(prefSchema);
    updatePreferences(prefId, pref);
    return getPreferences(prefId);
  }

  return {
    initialize,
    searchAll,
    execute,
    getPrefIds,
    getPreferences,
    updatePreferences,
    commitPreferences,
    resetPreferences
  };
};

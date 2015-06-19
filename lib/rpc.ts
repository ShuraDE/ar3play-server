
Skip to content
This repository

    Pull requests
    Issues
    Gist

    @ShuraDE

1
0

    3

ShuraDE/ar3play-server forked from gruppe-adler/ar3play-server

ar3play-server/lib/rpc.ts
@Fusselwurm Fusselwurm on 26 Apr incr rpc timeout to 90s

1 contributor
147 lines (125 sloc) 3.881 kB
/// <reference path="./../typings/tsd.d.ts" />

import _ = require('underscore');
import persist = require('./persist');
import arma = require('./arma');
import log = require('./log');

var
    timeout = 90000,
    rpc = require('sock-rpc'),
    logger = log.getLogger(__filename);

var keepAlive = _.debounce(function () {
    logger.warn('timeout! declaring mission as ended after getting no calls in ' + (timeout/1000) + ' seconds');
    persist.missionEnd();
}, timeout);

var verify = {
    str: function (variable: any, errorKey: string) {
        if (typeof variable !== 'string') {
            throw new Error('not a string: ' + errorKey);
        }
        return this;
    },
    arr: function (variable: any, errorKey: string) {
        if (!Array.isArray(variable)) {
            throw new Error('not an array: ' + errorKey);
        }
        return this;
    },
    fn: function (variable: any, errorKey: string) {
        if (typeof variable !== 'function') {
            throw new Error('not a function: ' + errorKey + ', but: ' + variable);
        }
        return this;
    },
    keepAlive: function () {
        keepAlive();
        return this;
    }
};

export function init(port) {
    registerAll();

    rpc.listen("::1", port);
    logger.info('listening for RPC calls on port ' + port);
    keepAlive();
}

/* [
 *   [
 *     id: int,
 *     x: int,
 *     y: int,
 *     z: int,
 *     dir: int,
 *     side: string,
 *     health: string,
 *     icon: string,
 *     name: string,
 *     container: int,
 *     content: int[]
 *   ]
 * ]
 *
 *
 */
export function setAllUnitData(allUnitData: Array<Array<any>>, callback: Function) {
    verify.arr(allUnitData, 'all units: array').keepAlive();
    allUnitData.forEach(function (datum) {
        setUnitDatum(datum, function () {});
    });

    callback && callback(null, 201);
}

export function setUnitDespawned(brokenUnits: Array<any>, callback: Function) {
    verify.arr(brokenUnits, 'array').keepAlive();
    
	brokenUnits.forEach(function (datum) {
        //something to do here 
    });

    callback && callback(null, 201);
}

export function setUnitDatum(unitData: Array<any>, callback: Function) {
    verify.arr(unitData, 'array').keepAlive();

    var model = arma.toUnit(unitData);
    persist.saveUnitDatum(model);

    callback && callback(null, 201);
}

/**
 *
 * NOTE: callback is *not* called immediately here,
 *       because subsequent client requests will assume mission is already changed
 */
export function missionStart(missionName: string, worldname: string, callback: Function) {
    verify.str(missionName, 'missionName').str(worldname, 'worldname').keepAlive();
    logger.info('mission started: ' + missionName);
    persist.missionStart(missionName, worldname, function (error: Error) {
        callback(error, 200);
    });
}

export function getDate(callback: Function) {
    keepAlive();
    logger.debug('getDate called :)');
    callback(null, new Date().toString());
}

export function missionEnd(callback: Function) {
    logger.info('mission end called.');
    persist.missionEnd();
    callback(null, 201);
}

export function setIsStreamable(isStreamable: boolean, cb: Function) {
    keepAlive();
    persist.setIsStreamable(isStreamable);
    cb(null, 201);
}

export function echo() {
    keepAlive();
    var args = Array.prototype.slice.call(arguments, 0);
    var callback = args.pop();

    logger.debug(args);

    callback(null, args);
}

function notImplemented() {
    var args = Array.prototype.slice.call(arguments, 0);
    var callback = args.pop();

    callback(new Error('not implemented'));
}

function registerAll() {
    rpc.register('echo', echo);
    rpc.register('getDate', getDate);
    rpc.register('missionStart', missionStart);
    rpc.register('missionEnd', missionEnd);
    rpc.register('setIsStreamable', setIsStreamable);
    rpc.register('setPlayerPosition', notImplemented);
    rpc.register('setAllPlayerData', notImplemented);
    rpc.register('setPlayerData', notImplemented);
    rpc.register('setUnitDatum', setUnitDatum);
    rpc.register('setAllUnitData', setAllUnitData);
}

    Status API Training Shop Blog About Help 

    © 2015 GitHub, Inc. Terms Privacy Security Contact 


/**
 * Create objects unter shelly.0 for a new shelly device
 * The Shelly device has to exist in the ./lib/devices/ directory
 */
 createObjects() {
    if (Object.keys(this.device).length === 0) {
        let devicetype = datapoints.getDeviceNameForCoAP(this.getDeviceType());
        let devices = datapoints.getDeviceByType(devicetype, 'coap');
        if (devices) {
            devices = recursiveSubStringReplace(devices, new RegExp('<devicetype>', 'g'), devicetype);
            devices = recursiveSubStringReplace(devices, new RegExp('<deviceid>', 'g'), this.getSerialId());
            for (let j in devices) {
                let statename = j;
                let state = devices[statename];
                state.state = statename;
                let deviceid = this.getDeviceName();
                if (!this.states[deviceid] || this.states[deviceid] !== deviceid) {
                    this.states[deviceid] = deviceid;
                    this.objectHelper.setOrUpdateObject(deviceid, {
                        type: 'device',
                        common: {
                            name: 'Device ' + deviceid
                        },
                        native: {}
                    }, ['name']);
                }
                let channel = statename.split('.').slice(0, 1).join();
                if (channel !== statename) {
                    let channelid = deviceid + '.' + channel;
                    if (!this.states[channelid] || this.states[channelid] !== channelid) {
                        this.states[channelid] = channelid;
                        this.objectHelper.setOrUpdateObject(channelid, {
                            type: 'channel',
                            common: {
                                name: 'Channel ' + channel
                            }
                        }, ['name']);
                    }
                }
                let stateid = deviceid + '.' + statename;
                let controlFunction;
                if (state.coap && state.coap.http_cmd && !state.coap.coap_cmd) {
                    controlFunction = async (value) => {
                        if (state.coap && state.coap.http_cmd_funct) {
                            try {
                                value = isAsync(state.coap.http_cmd_funct) ? await state.coap.http_cmd_funct(value, this) : state.coap.http_cmd_funct(value, this);
                            } catch (error) {
                                this.adapter.log.error('Error in function state.coap.http_cmd_funct for state ' + stateid + ' for ' + this.getName() + ' (' + error + ')');
                            }
                        }
                        let body;
                        let params;
                        try {
                            if (this.auth) {
                                params = {
                                    url: 'http://' + this.getIP() + state.coap.http_cmd,
                                    timeout: this.httptimeout,
                                    qs: value,
                                    headers: {
                                        'Authorization': this.auth
                                    }
                                };
                            } else {
                                params = {
                                    url: 'http://' + this.getIP() + state.coap.http_cmd,
                                    timeout: this.httptimeout,
                                    qs: value
                                };
                            }
                            this.adapter.log.debug('Call url ' + JSON.stringify(params) + ' for ' + this.getName());
                            body = await requestAsync(params);
                            // this.adapter.log.debug('Create Object body : ' + body);
                        } catch (error) {
                            if (body && body === '401 Unauthorized') {
                                this.adapter.log.error('Wrong http username or http password! Please enter the user credential from restricted login for ' + this.getName());
                            } else {
                                this.adapter.log.error('Error in function state.coap.http_cmd for state ' + stateid + ' and request' + JSON.stringify(params) + ' for ' + this.getName() + ' (' + error + ')');
                            }
                        }
                        delete this.states[stateid];
                    };
                }
                if (state.coap && state.coap.http_publish && !state.coap.coap_publish) {
                    if (!this.http[state.coap.http_publish]) this.http[state.coap.http_publish] = [];
                    this.http[state.coap.http_publish].push(statename);
                }
                let value;
                if (state.coap.coap_init_value) value = state.coap.coap_init_value;
                this.objectHelper.setOrUpdateObject(stateid, {
                    type: 'state',
                    common: state.common
                }, ['name'], value, controlFunction);
            }
            this.device = devices;
        }
        this.objectHelper.processObjectQueue(() => { });
    }
}
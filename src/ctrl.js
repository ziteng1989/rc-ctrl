/*! *****************************************************************************
Copyright (c) 店家 Corporation. All rights reserved. 
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0  
 
THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE, 
MERCHANTABLITY OR NON-INFRINGEMENT. 
 
See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.

作者: 紫藤

******************************************************************************/

import React from 'react';
import { curry, equals, clone } from 'ramda';
import FjsPromise from './commons/promise';
import isPromise from './commons/is-promise';

/**
 * 创建高阶组建,用于绑定state和页面逻辑处理
 * @param options 构建配制
 * @param taget 目标组建
 */
export default function controller(options, target) {
    return class extends React.PureComponent {
        
        currentState = options.getInitState();

        actions = {};

        dispatch = curry((handler, payload) => {
            return new FjsPromise((resolve, reject) => {
                // handler必须是函数类型
                if(typeof handler === 'function') {
                    let promise = null, data = null;
                    if (isPromise(payload)) { // 判断payload是否是promise对象
                        promise = payload;
                    } else if (payload && isPromise(payload.promise)) { // 判断payload.proimise是否是promise对象, data可传递参数，用于支持异步操作时带入参数
                        promise = payload.promise;
                        data = payload.data;
                    } else { // payload是普通javascript对象
                        data = payload;
                    }
                    if (promise) {
                        // 处理promise对象
                        promise.then((response) => {
                            // 重新更新state，并结束promise --- fulfilled
                            this.setState(handler(Object.assign({}, this.currentState), { payload: response }, 'FULFILLED'), () => {
                                resolve(Object.assign({}, this.currentState));
                            });
                        }).catch((err) => {
                            // 重新更新state，并结束promise --- rejected
                            this.setState(handler(Object.assign({}, this.currentState), { payload: err }, 'REJECTED'), () => {
                                reject(err);
                            });
                        });
                        // 重新更新state，并立即分发pending
                        return this.setState(handler(Object.assign({}, this.currentState), { payload: data }, 'PENDING'));
                    } else {
                        // 立即分发payload
                        return this.setState(handler(Object.assign({}, this.currentState), { payload: data }), () => {
                            resolve(Object.assign({}, this.currentState));
                        });
                    }
                } else {
                    // 强制抛异常
                    throw new Error('handler必须是函数类型');
                }
            });
        });

        componentWillMount() {
            this.actions = options.actions({ dispatch:this.dispatch }); // 页面逻辑
        }

        render() {
            // 创建属性代理对象, 并添加额外属性
            return React.createElement(target, Object.assign({}, this.props, {
                state: clone(this.currentState), // 页面状态
                actions: this.actions // 页面逻辑
            }));
        }

        setState(newState, callback) {
            const oldState = clone(this.currentState);
            this.currentState = clone(newState);
            // 浅比较
            if (!equals(oldState, newState)) {
                this.forceUpdate(callback);
            } else {
                if (callback) {
                    //执行回调，结束promise
                    callback();
                }
            }
        }
    } 
}
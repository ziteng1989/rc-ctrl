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

***************************************************************************** */

import { Promise } from 'es6-promise';

export default class FjsPromise extends Promise {
    /**
     * map :: Functor f => f a ~> (a -> b) -> f b
     * @param func 
     */
    map(func) {
        return new FjsPromise((resolve, reject) => {
            this.then(response => {
                resolve(func(response));
            }).catch(err => {
                reject(err);
            });
        });
    }

    /**
     * ap :: Apply f => f a ~> f (a -> b) -> f b
     * @param promise 
     */
    ap(promise) {
        return this.map(func => {
            return promise.map(func);
        });
    }
}

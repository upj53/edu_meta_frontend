import qs from "qs";
import { get } from "svelte/store";
import { push } from "svelte-spa-router";
import { access_token, userid, is_student, is_teacher } from "../lib/store";

const fastapi = async function (operation, url, params, success_callback, failure_callback) {
    let method = operation;
    let content_type = 'application/json';
    let body = JSON.stringify(params);

    if (operation === 'login') {
        method = 'post';
        content_type = 'application/x-www-form-urlencoded';
        body = qs.stringify(params);
    }

    if (operation === 'await') {
        method = 'get';
    }

    let server_status = import.meta.env.VITE_SERVER_STATUS;
    let _url = '';
    if (server_status == 'localhost') {
        _url = import.meta.env.VITE_SERVER_URL_LOCALHOST_VALUE + url;
    }
    else if (server_status == 'goorm') {
        _url = import.meta.env.VITE_SERVER_URL_GOORM_VALUE + url;
    }
    else if (server_status == 'myserver') {
        _url = import.meta.env.VITE_SERVER_URL_HOMESERVER_VALUE + url;
    }
    if (method === 'get') {
        _url += '?' + new URLSearchParams(params);
    }

    let options = {
        method: method,
        headers: {
            'Content-Type': content_type
        }
    };

    const _access_token = get(access_token);
    if (_access_token) {
        options.headers['Authorization'] = 'Bearer ' + _access_token;
    }

    if (method !== 'get') {
        options['body'] = body;
    }

    await fetch(_url, options)
        .then(response => {
            if (response.status === 204) { // No content
                if (success_callback) {
                    success_callback();
                }
                return;
            }
            response.json()
                .then(json => {
                    if (response.status >= 200 && response.status < 300) { // 200~299
                        if (operation === 'await') {
                            json;
                            return;
                        }
                        if (success_callback) {
                            success_callback(json);
                        }
                    } else if (operation !== 'login' && response.status === 401) { // token time out
                        access_token.set('');
                        userid.set('');
                        is_student.set(false);
                        is_teacher.set(false);
                        alert('로그인이 필요합니다');
                        push('/user-login');
                    } else {
                        if (failure_callback) {
                            failure_callback(json);
                        } else {
                            console.log(json);
                        }
                    }
                })
                .catch(error => {
                    console.log(error);
                });
        }
        );
};

export default fastapi;

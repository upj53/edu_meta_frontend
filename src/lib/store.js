import { writable } from 'svelte/store';

const persist_storage = (key, initValue) => {
    const storedValueStr = localStorage.getItem(key);
    const store = writable(storedValueStr != null ? JSON.parse(storedValueStr) : initValue);  //JSON.parse(storedValueStr)
    store.subscribe((val) => {
        localStorage.setItem(key, JSON.stringify(val));
    });
    return store;
};

export const access_token = persist_storage('access_token', '');
export const is_student = persist_storage('is_student', false);
export const is_teacher = persist_storage('is_teacher', false);
export const userid = persist_storage('userid', '');
export const student_current_classroom = persist_storage('student_current_classroom', 0);
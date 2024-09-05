<script>
    import { link, push } from "svelte-spa-router";
    import fastapi from "../lib/api";
    import { student_current_classroom } from "../lib/store";
    import Error from "../components/Error.svelte";

    let error = { detail: [] };

    export let params = {};
    let userid = params.id;
    let username = "";
    let email = "";
    let current_classroom = 0;
    let classroom_list = [];

    function get_user() {
        fastapi(
            "get",
            `/edu/user/${userid}`,
            {},
            (json1) => {
                fastapi(
                    "get",
                    "/edu/develop/classroom/list",
                    {},
                    (json2) => {
                        classroom_list = json2.classroom_list;
                        username = json1.username;
                        email = json1.email;
                        current_classroom = json1.current_classroom;
                    },
                    (json2_error) => {},
                );
            },
            (json_error) => {},
        );
    }
    get_user();
</script>

<div class="container">
    <h5 class="my-2 border-bottom pb-2">학생 정보</h5>
    <Error {error} />
    <div class="mb-3">
        <label for="">사용자 아이디</label>
        <p class="mt-1 ms-3" style="font-weight:bold;">{userid}</p>
    </div>
    <div class="mb-3">
        <label for="">클래스룸</label>
        <select
            name=""
            id=""
            class="form-select"
            bind:value={current_classroom}
            disabled
        >
            <option value={0}>아직 클래스룸을 선택하지 않았습니다.</option>
            {#each classroom_list as classroom}
                <option value={classroom.idx}>{classroom.title}</option>
            {/each}
        </select>
    </div>
    <div class="mb-3">
        <label for="">이름</label>
        <p class="mt-1 ms-3" style="font-weight:bold;">{username}</p>
    </div>
    <div class="mb-3">
        <label for="">이메일</label>
        <p class="mt-1 ms-3" style="font-weight:bold;">{email}</p>
    </div>
    <button
        class="btn btn-primary"
        type="submit"
        on:click={() => {
            push(`/edu-student-update/${userid}`);
        }}>수정</button
    >
    <button
        class="btn btn-primary"
        on:click={() => {
            push("/edu-students");
        }}>목록</button
    >
</div>

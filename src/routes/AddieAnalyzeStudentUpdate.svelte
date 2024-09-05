<script>
    import { push } from "svelte-spa-router";
    import fastapi from "../lib/api";
    import Error from "../components/Error.svelte";

    let error = { detail: [] };
    let success_msg = "";

    export let params = {};
    let userid = params.id;
    let username = "";
    let email = "";
    let current_classroom = 0;
    let classroom_list = [];
    let classroom_dict = {};

    function update_user_classroom(event) {
        event.preventDefault();
        let update_params = {
            userid: userid,
            current_classroom: current_classroom,
        };
        fastapi(
            "put",
            `/edu/student/update/my-classroom/${userid}`,
            update_params,
            (json) => {
                if (current_classroom == 0) {
                    success_msg = `성공적으로 수정했습니다.`;
                } else {
                    success_msg = `'${classroom_dict[current_classroom].title}' 으로 성공적으로 수정했습니다.`;
                }
            },
            (json_error) => {
                error = json_error;
            },
        );
    }

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
                        // console.log(JSON.stringify(classroom_list));
                        for (let i = 0; i < json2.classroom_list.length; i++) {
                            let obj = json2.classroom_list[i];
                            classroom_dict[obj["idx"]] = obj;
                        }
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
    {#if success_msg}
        <div class="alert alert-success" role="alert">
            {success_msg}
        </div>
    {/if}
    <div class="mb-3">
        <label for="">사용자 아이디</label>
        <p class="mt-1 ms-3" style="font-weight:bold;">{userid}</p>
    </div>
    <div class="mb-3">
        <label for="">클래스룸</label>
        <select
            name=""
            id="sel-classroom"
            class="form-select"
            bind:value={current_classroom}
        >
            <option value={0}>--- 선택해주세요 ---</option>
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
        on:click={update_user_classroom}>수정하기</button
    >
    <button
        class="btn btn-primary"
        on:click={() => {
            push("/edu-students");
        }}>목록</button
    >
</div>

<script>
    import { querystring, link, push } from "svelte-spa-router";
    import fastapi from "../lib/api";
    import { userid } from "../lib/store";
    import Error from "../components/Error.svelte";

    let error = { detail: [] };

    let params = new URLSearchParams($querystring);
    let user_type = "student";
    let teacherid = "";
    if (params.has("teacher")) {
        user_type = "teacher";
    } else {
        teacherid = `${$userid}`;
    }

    let create_userid = "";
    let create_password1 = "";
    let create_password2 = "";
    let create_username = "";
    let create_email = "";

    function create_user(event) {
        event.preventDefault();
        let url = "/edu/user/create";
        let params = {
            userid: create_userid,
            usertype: user_type,
            password1: create_password1,
            password2: create_password2,
            username: create_username,
            email: create_email,
            current_classroom: 0,
            teacherid: teacherid,
        };
        fastapi(
            "post",
            url,
            params,
            (json) => {
                push("/");
            },
            (json_error) => {
                error = json_error;
            },
        );
    }
</script>

<div class="container my-3">
    {#if user_type == "student"}
        <h5 class="my-2 border-bottom pb-2">학생 회원가입</h5>
    {:else if user_type == "teacher"}
        <h5 class="my-2 border-bottom pb-2">교사 회원가입</h5>
    {/if}
    <Error {error} />
    <form method="post">
        <div class="mb-3">
            <label for="userid">사용자 아이디</label>
            <input
                type="text"
                class="form-control"
                id="userid"
                bind:value={create_userid}
                placeholder="사용할 아이디를 영문 또는 영문과 숫자의 조합으로 입력해주세요."
            />
        </div>
        <div class="mb-3">
            <label for="password1">비밀번호</label>
            <input
                type="password"
                class="form-control"
                id="password1"
                bind:value={create_password1}
                placeholder="비밀번호를 입력해주세요."
            />
        </div>
        <div class="mb-3">
            <label for="password2">비밀번호 확인</label>
            <input
                type="password"
                class="form-control"
                id="password2"
                bind:value={create_password2}
                placeholder="비밀번호를 다시 입력해주세요."
            />
        </div>
        <div class="mb-3">
            <label for="username">이름</label>
            <input
                type="text"
                class="form-control"
                id="username"
                bind:value={create_username}
                placeholder="이름을 입력해주세요."
            />
        </div>
        <div class="mb-3">
            <label for="email">이메일</label>
            <input
                type="email"
                class="form-control"
                id="email"
                bind:value={create_email}
                placeholder="이메일을 입력해주세요."
            />
        </div>
        <button class="btn btn-primary" type="submit" on:click={create_user}
            >가입하기</button
        >
    </form>
</div>

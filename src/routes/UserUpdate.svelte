<script>
    import { querystring, link, push } from "svelte-spa-router";
    import fastapi from "../lib/api";
    import Error from "../components/Error.svelte";
    import { userid } from "../lib/store";

    let error = { detail: [] };

    let params = new URLSearchParams($querystring);
    let user_type = "student";
    if (params.has("teacher")) {
        user_type = "teacher";
    }

    let has_change_password = false;
    let password1 = "";
    let password2 = "";
    let usertype = "";
    let username = "";
    let email = "";
    let current_classroom = 0;

    fastapi(
        "get",
        `/edu/user/${$userid}`,
        {},
        (json) => {
            usertype = json.usertype;
            username = json.username;
            email = json.email;
            current_classroom = json.current_classroom;
        },
        (json_error) => {},
    );

    function update_user(event) {
        event.preventDefault();
        let update_params = {
            userid: $userid,
            usertype: user_type,
            password1: password1,
            password2: password2,
            username: username,
            email: email,
            current_classroom: current_classroom,
        };
        fastapi(
            "put",
            `/edu/user/update/${$userid}`,
            update_params,
            (json) => {
                alert("정보를 수정했습니다.");
            },
            (json_error) => {
                error = json_error;
            },
        );
    }
</script>

<div class="container my-3">
    {#if user_type == "student"}
        <h5 class="my-2 border-bottom pb-2">학생정보 수정</h5>
    {:else if user_type == "teacher"}
        <h5 class="my-2 border-bottom pb-2">교사정보 수정</h5>
    {/if}
    <Error {error} />
    <form method="post">
        <div class="mb-3">
            <label for="userid">사용자 아이디</label>
            <p class="mt-1 ms-3" style="font-weight:bold;">{$userid}</p>
        </div>
        <div class="mb-3 form-check">
            <input
                class="form-check-input"
                type="checkbox"
                bind:checked={has_change_password}
                id="flexCheckDefault"
                on:change={() => {
                    let form1 = document.getElementById("password1_form");
                    let form2 = document.getElementById("password2_form");
                    if (has_change_password) {
                        form1.style.display = "block";
                        form2.style.display = "block";
                    } else {
                        form1.style.display = "none";
                        form2.style.display = "none";
                        password1 = "";
                        password2 = "";
                    }
                }}
            />
            <label class="form-check-label" for="flexCheckDefault">
                비밀번호 변경
            </label>
        </div>
        <div class="mb-3" id="password1_form" style="display:none;">
            <label for="password1">비밀번호</label>
            <input
                type="password"
                class="form-control"
                id="password1"
                bind:value={password1}
                placeholder="비밀번호를 입력해주세요."
            />
        </div>
        <div class="mb-3" id="password2_form" style="display:none;">
            <label for="password2">비밀번호 확인</label>
            <input
                type="password"
                class="form-control"
                id="password2"
                bind:value={password2}
                placeholder="비밀번호를 다시 입력해주세요."
            />
        </div>
        <div class="mb-3">
            <label for="username">이름</label>
            <input
                type="text"
                class="form-control"
                id="username"
                bind:value={username}
                placeholder="이름을 입력해주세요."
            />
        </div>
        <div class="mb-3">
            <label for="email">이메일</label>
            <input
                type="email"
                class="form-control"
                id="email"
                bind:value={email}
                placeholder="이메일을 입력해주세요."
            />
        </div>
        <button class="btn btn-primary" type="submit" on:click={update_user}
            >수정하기</button
        >
    </form>
</div>

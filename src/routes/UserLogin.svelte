<script>
  import { link, push } from "svelte-spa-router";
  import Error from "../components/Error.svelte";
  import fastapi from "../lib/api";
  import {
    access_token,
    userid,
    is_student,
    is_teacher,
    student_current_classroom,
  } from "../lib/store";

  let error = { detail: [] };
  let login_userid = "";
  let login_password = "";
  let is_teacher_login = false;
  let is_student_login = !is_teacher_login;
  const teacher_login_url = "/edu/teacher/login";
  const student_login_url = "/edu/student/login";
  let url = student_login_url;

  function login_user(event) {
    event.preventDefault();
    let params = {
      username: login_userid,
      password: login_password,
    };
    fastapi(
      "login",
      "/edu/user/login",
      params,
      (json) => {
        // console.log(JSON.stringify(json));
        $access_token = json.access_token;
        $userid = json.userid;
        if (json.usertype == "student") {
          $is_student = true;
          $is_teacher = false;
          $student_current_classroom = json.current_classroom;
        } else if (json.usertype == "teacher") {
          $is_student = false;
          $is_teacher = true;
        }
        // console.log(`${$access_token}\n${$userid}`);
        // console.log(`is_student=${$is_student}\nis_teacher=${$is_teacher}`);
        push("/");
      },
      (json_error) => {
        error = json_error;
      }
    );
  }
</script>

<div class="container">
  <h5 class="my-3 border-bottom pb-2">로그인</h5>
  <div class="text-end" style="display:none;" id="teacher-create">
    <a use:link href="/user-create?teacher">관리자 회원가입</a>
  </div>
  <Error {error} />
  <form method="post">
    <div class="mb-3">
      <label for="login_userid">사용자 아이디</label>
      <input
        type="text"
        class="form-control"
        id="login_userid"
        bind:value={login_userid}
        placeholder="아이디를 입력해주세요."
      />
    </div>
    <div class="mb-3">
      <label for="login_password">비밀번호</label>
      <input
        type="password"
        class="form-control"
        id="login_password"
        bind:value={login_password}
        placeholder="비밀번호를 입력해주세요."
      />
    </div>
    <div class="d-flex justify-content-between">
      <button class="btn btn-primary" type="submit" on:click={login_user}
        >로그인</button
      >
    </div>
  </form>
  <div class="d-flex justify-content-center mt-3">
    <button
      class="btn btn-success"
      on:click={() => {
        login_userid = "teacher";
        login_password = "12345";
      }}>샘플 <b>교사</b> 계정 입력</button
    >
    <button
      class="btn btn-success ms-5"
      on:click={() => {
        login_userid = "student1";
        login_password = "12345";
      }}>샘플 <b>학생</b> 계정 입력</button
    >
  </div>
</div>

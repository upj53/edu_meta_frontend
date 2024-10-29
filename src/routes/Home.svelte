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
  let error_message = "";
  let success_message = "";
  let login_userid = "";
  let login_password = "";
  let is_teacher_login = false;
  let is_student_login = !is_teacher_login;
  const teacher_login_url = "/edu/teacher/login";
  const student_login_url = "/edu/student/login";
  let url = student_login_url;

  let current_classroom = 0;
  let current_classroom_display = 0;

  let student_my_classroom_list = [];
  let student_my_classroom_dict = {};
  let student_my_classroom = {};
  let student_my_classroom_created_at = "";
  let student_classroom_list = [];
  let student_classroom_dict = {};
  let student_classroom_title = "";
  let student_time_goal_status = 0;
  let student_time_goal_at = null;
  let student_time_goal = null;
  let student_time_goal_delay = [];

  let teacher_my_classroom_list = [];
  let teacher_student_dict = {};
  let teacher_classroom_dict = {};
  let teacher_my_classroom_status = {
    0: "학습중",
    1: "제출완료",
    2: "채점중",
    3: "채점완료",
    4: "학생확인",
    5: "",
  };
  let carousel_img_idx = 0;
  let carousel_img_list = [
    "https://github.com/user-attachments/assets/2ad0c5b7-f403-4d94-bccc-0bc1c0048360",
    "https://github.com/user-attachments/assets/2f040c07-50a9-4faf-916a-4c6ea9c016e7",
    "https://github.com/user-attachments/assets/8b5afea0-7b34-4856-93ea-e94b8040d46f",
    "https://github.com/user-attachments/assets/6d81e520-7a04-4938-b118-00b2b0001b21",
    "https://github.com/user-attachments/assets/79cb1a22-ef25-4046-9ef6-a970665bf40c",
    "https://github.com/user-attachments/assets/1a3311e8-3b3b-4cf7-8569-e7548fdb6da5",
    "https://github.com/user-attachments/assets/a711442b-7011-41c0-9c1b-61c1ae41903a",
    "https://github.com/user-attachments/assets/8818e1b3-2bc8-4be7-bf79-918e971e2381",
    "https://github.com/user-attachments/assets/41d0c5f6-7ac1-44ac-9ab9-807d38d4a297",
    "https://github.com/user-attachments/assets/49186221-0c8a-4413-9a50-27f8731523a0",
    "https://github.com/user-attachments/assets/ff7600d0-51e6-4e6e-b62c-00338e4c8fe4",
    "https://github.com/user-attachments/assets/4670ae39-a83d-44a0-9f66-671691ac58b2",
    "https://github.com/user-attachments/assets/8397e7ef-c8b0-48d5-a1d6-7147bfbb8ddf",
    "https://github.com/user-attachments/assets/127b7095-6688-4d8f-aa42-c23944fb7f13",
    "https://github.com/user-attachments/assets/09d17e9f-6948-4f24-aff9-39e52615c46d",
    "https://github.com/user-attachments/assets/3f60f358-8945-421b-922e-94a3159418c4",
    "https://github.com/user-attachments/assets/5913685a-e2c1-48ea-b9b7-c8eaf74f9508",
    "https://github.com/user-attachments/assets/d089db71-f0c0-4b2c-a143-b0193e6cded6",
    "https://github.com/user-attachments/assets/c4023406-41d7-45c5-bcc7-bee5a165ba4d",
    "https://github.com/user-attachments/assets/46a6b13a-460d-4ff9-a3af-c856ec57f119",
    "https://github.com/user-attachments/assets/28412f0b-5a55-4e61-a86f-8a08408954ff",
    "https://github.com/user-attachments/assets/ff1bab8f-3dc1-47be-b0de-a520b94a3c77",
    "https://github.com/user-attachments/assets/351dddff-05ac-410d-99eb-6d79805b825d",
    "https://github.com/user-attachments/assets/0e821b12-bdce-4018-a239-8e706ad76841",
    "https://github.com/user-attachments/assets/96a93f28-100c-4496-80af-c6ad52abb066",
    "https://github.com/user-attachments/assets/8bb8b61e-3c4c-4857-87d2-f46a1a87914c",
    "https://github.com/user-attachments/assets/78cc096d-8eec-4733-90ab-ca5d9feb9853",
    "https://github.com/user-attachments/assets/ffafa6bb-6c14-4206-8ac0-6b30644e95d4",
    "https://github.com/user-attachments/assets/38a6aa83-7386-4bff-9fb8-a18670657144",
    "https://github.com/user-attachments/assets/8f3e0c93-6ef8-4710-b47d-d5c2e281d275",
    "https://github.com/user-attachments/assets/d47da634-7160-4967-829c-8b231e54e2c3",
    "https://github.com/user-attachments/assets/fb9200d1-5ed0-49cd-9e00-1a3c973c2c0a",
    "https://github.com/user-attachments/assets/cb51582c-0373-4117-bc76-3752c78bb5c9",
    "https://github.com/user-attachments/assets/4ed5704b-bcfc-47e1-9b23-c4eac8810b39",
    "https://github.com/user-attachments/assets/0936e1f1-ef1c-4bef-9caf-0c6cbeaf3201",
    "https://github.com/user-attachments/assets/d741f626-7770-4926-b729-394ebb50b4fa",
    "https://github.com/user-attachments/assets/62099aa1-c862-4da8-bb6a-ce1d387c007f",
    "https://github.com/user-attachments/assets/f25fb0ac-6a89-4647-838f-9e31e61c1b56",
    "https://github.com/user-attachments/assets/5be7cf14-85b6-4ea6-ae72-d1566f2c2558",
    "https://github.com/user-attachments/assets/64c271a1-50bc-4164-8186-61feda4b6d48",
    "https://github.com/user-attachments/assets/f1302b00-fa26-4b82-9aa0-2733891f8703",
    "https://github.com/user-attachments/assets/27201d60-1490-487d-bcb4-92f52ebc3fbd",
    "https://github.com/user-attachments/assets/dbcc194f-2b0f-4e1b-9ad2-066cdeaf11e0",
    "https://github.com/user-attachments/assets/0c02b244-a176-43e8-a30b-65e399dbc23b",
    "https://github.com/user-attachments/assets/f135f0de-cdb8-47fd-bdd6-30ae3d772b4b",
    "https://github.com/user-attachments/assets/91a4f474-c54c-4a5c-9498-0d79f8c48651",
    "https://github.com/user-attachments/assets/f36c42b8-c946-476a-8383-c4786fb5511b",
    "https://github.com/user-attachments/assets/b15895a2-c3a7-4491-9486-5f1f8ece1a88",
    "https://github.com/user-attachments/assets/60072ec8-0e4e-4a01-8bb5-d93d41f7df00",
    "https://github.com/user-attachments/assets/eb0a2ae4-1a51-4097-a073-74a5aee15ddd",
    "https://github.com/user-attachments/assets/fd09ce23-1484-4980-921b-a8955af800fd",
    "https://github.com/user-attachments/assets/bf7fb5e8-abf3-41b3-816c-4e70efdc9e4a",
    "https://github.com/user-attachments/assets/b645012d-8c58-42f6-a948-9dd51a14eee0",
    "https://github.com/user-attachments/assets/1a81b86e-6029-4f29-b272-7527ff82e90c",
    "https://github.com/user-attachments/assets/e774e1f4-2dc9-48ea-9c92-0ce86dcdd438",
    "https://github.com/user-attachments/assets/2bb921e5-0bb7-4f44-ac7f-0b0d3f4c9242",
    "https://github.com/user-attachments/assets/d93fa5b3-ca34-42ba-95aa-b345e131ce48",
    "https://github.com/user-attachments/assets/a1ece7a2-2c0e-43c5-975a-ad2fc4d6b1f9",
    "https://github.com/user-attachments/assets/d32bc958-ed9e-43c5-88d8-3573fcfdcf8e",
    "https://github.com/user-attachments/assets/522dd0e6-ffdf-4ae0-b62d-128efb14a97a",
    "https://github.com/user-attachments/assets/4cbe7ae8-5691-46d7-8d20-2d7a8a8fae2a",
    "https://github.com/user-attachments/assets/16db2335-38ef-4b9f-9c92-0f067ebec98d",
    "https://github.com/user-attachments/assets/13d84363-029f-47bc-927f-4ffada78d50b",
    "https://github.com/user-attachments/assets/c50e752d-e938-495b-8f46-2b8d55a9dab4",
    "https://github.com/user-attachments/assets/424447c1-5a51-4d8f-8a45-e6d4cd6d94b4",
    "https://github.com/user-attachments/assets/89c95971-89d3-47e2-85b4-c8911e2a064f",
  ];

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

  function get_teacher_student_classrooms(teacherid) {
    fastapi(
      "get",
      `/edu/teacher/${teacherid}/classroom/list`,
      {},
      (json) => {
        // console.log(`teacherid=${teacherid}`);
        for (let i = 0; i < json.student_list.length; i++) {
          let obj = json.student_list[i];
          teacher_student_dict[obj["userid"]] = obj;
        }
        // console.log(`student_dict=\n${JSON.stringify(teacher_student_dict)}`);
        for (let i = 0; i < json.classroom_list.length; i++) {
          let obj = json.classroom_list[i];
          teacher_classroom_dict[obj["idx"]] = obj;
        }
        // console.log( `classroom_dict=\n${JSON.stringify(teacher_classroom_dict)}`);
        // console.log( `json.my_classroom_list=\n${JSON.stringify(json.my_classroom_list)}`);
        for (let i = 0; i < json.my_classroom_list.length; i++) {
          let obj = json.my_classroom_list[i];
          if (obj["userid"] in teacher_student_dict) {
            // teacher_my_classroom_list.push(obj)
            teacher_my_classroom_list.unshift(obj);
          }
        }
        // console.log( `json.my_classroom_list=\n${JSON.stringify(teacher_my_classroom_list)}`);
      },
      (json_error) => {}
    );
  }

  function get_student_info() {
    if ($userid != "") {
      fastapi(
        "get",
        `/edu/user/${$userid}`,
        {},
        (json0) => {
          current_classroom = json0.current_classroom;
          current_classroom_display = current_classroom;
          // console.log(`current_classroom=${JSON.stringify(current_classroom)}`);
          if (current_classroom == 0) {
            error_message = `클래스룸 학습설정이 완료되어 있지 않습니다. 학습할 주제를 선택해주세요.`;
          } else {
            error_message = "";
          }
          fastapi(
            "get",
            "/edu/develop/classroom/list",
            {},
            (json1) => {
              if (current_classroom == 0) {
                student_classroom_list = json1.classroom_list;
                for (let i = 0; i < student_classroom_list.length; i++) {
                  let obj = student_classroom_list[i];
                  student_classroom_dict[obj["idx"]] = obj;
                }
                // console.log( `classroom_list=\n${JSON.stringify(classroom_list)}`,);
                return false;
              }
              fastapi(
                "get",
                `/edu/student/my-classroom/${$userid}/list`,
                {},
                (json2) => {
                  student_my_classroom_list = json2.my_classroom_list;
                  // console.log( `my_classroom_list=\n${JSON.stringify(my_classroom_list)}`,);
                  for (let i = 0; i < student_my_classroom_list.length; i++) {
                    let obj = student_my_classroom_list[i];
                    student_my_classroom_dict[obj["classroom_idx"]] = obj;
                  }
                  // my_classroom_idx = my_classroom_dict[current_classroom].idx;
                  // console.log( `my_classroom_dict[now]=\n${JSON.stringify(student_my_classroom_dict[student_current_classroom])}`,);
                  // console.log(`current_classroom = ${current_classroom}`)
                  // console.log(`time_goal_status = ${time_goal_status}`)
                  // console.log(`time_goal_at = ${time_goal_at}`)
                  // console.log(`time_goal = ${time_goal}`)
                  student_classroom_list = json1.classroom_list;
                  for (let i = 0; i < student_classroom_list.length; i++) {
                    let obj = student_classroom_list[i];
                    student_classroom_dict[obj["idx"]] = obj;
                  }
                  student_classroom_title =
                    student_classroom_dict[current_classroom].title;
                  // console.log( `classroom_dict[current_classroom]=\n${JSON.stringify(student_classroom_dict[student_current_classroom])}`,);
                },
                (json2_error) => {}
              );
            },
            (json1_error) => {}
          );
        },
        (json_error) => {}
      );
    }
  }
</script>

{#if $is_student == true}
  {#if $student_current_classroom == 0}
    <div class="alert alert-warning m-3" role="alert">
      학습설정 메뉴에서 학습모듈을 선택해주세요.
    </div>
  {:else}
    {#await get_student_info()}
      <div
        class="d-flex justify-content-center"
        style="height:300px; padding-top: 150px;"
      >
        <div
          class="spinner-grow text-primary"
          style="width: 5rem; height: 5rem;"
          role="status"
        >
          <span class="visually-hidden">로딩중입니다...</span>
        </div>
      </div>
    {:then}
      <h5 class="ms-5 me-5 mt-3 mb-2 border-bottom">진행중인 학습모듈</h5>
      <span class="ms-5 me-5 mt-1 ps-3 fw-bold">{student_classroom_title}</span>
      <h5 class="ms-5 me-5 mt-3 mb-2 border-bottom">디지털 교과서</h5>
      <div class="alert alert-info ms-5 me-5" role="alert">
        본 교육 플랫폼은 <span style="color:blue; font-weight:bold;"
          >수업 후 진행되는 평가 도구</span
        >입니다.<br />
        <br />
        학생은 교사의 수업을 들은 후,<br />
        메타인지와 인공지능의 도움을 받아 자기주도 학습을 진행할 수 있습니다.<br
        />
        <br />
        아래 이미지는 수업 때 진행되는 디지털 교과서의 샘플입니다.
      </div>
      <div id="carouselExample" class="carousel carousel-dark slide ms-5 me-5">
        <div class="carousel-inner">
          <div class="carousel-item active">
            <img
              src={carousel_img_list[carousel_img_idx]}
              class="d-block w-100"
              alt=""
            />
          </div>
        </div>
        <button
          class="carousel-control-prev"
          type="button"
          on:click={() => {
            if (carousel_img_idx > 0) {
              carousel_img_idx--;
            }
          }}
        >
          <span class="carousel-control-prev-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Previous</span>
        </button>
        <button
          class="carousel-control-next"
          type="button"
          on:click={() => {
            if (carousel_img_idx < carousel_img_list.length) {
              carousel_img_idx++;
            }
          }}
        >
          <span class="carousel-control-next-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Next</span>
        </button>
      </div>
    {/await}
  {/if}
{:else if $is_teacher == true}
  {#await get_teacher_student_classrooms(`${$userid}`)}
    <div
      class="d-flex justify-content-center"
      style="height:300px; padding-top: 150px;"
    >
      <div
        class="spinner-grow text-primary"
        style="width: 5rem; height: 5rem;"
        role="status"
      >
        <span class="visually-hidden">로딩중입니다...</span>
      </div>
    </div>
  {:then _}
    <h5 class="ms-5 me-5 mt-5 mb-3 border-bottom">진행중인 학습모듈</h5>
    <div class="ms-5 me-5">
      <table class="table">
        <thead>
          <tr class="text-center table-dark">
            <th>순번</th>
            <th>아이디</th>
            <th>이름</th>
            <th>학습모듈</th>
            <th>상태</th>
          </tr>
        </thead>
        <tbody>
          {#each teacher_my_classroom_list as classroom, idx}
            <tr class="text-center">
              <td>{idx + 1}</td>
              <td>{classroom.userid}</td>
              <td>{teacher_student_dict[classroom.userid].username}</td>
              <td
                >{classroom.classroom_idx}. {teacher_classroom_dict[
                  classroom.classroom_idx
                ].title}</td
              >
              <td>{teacher_my_classroom_status[classroom.classroom_status]}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/await}
{:else}
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
{/if}

<script>
  import { link } from "svelte-spa-router";
  import fastapi from "../lib/api";
  import { access_token, userid } from "../lib/store";

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
        // console.log( `teacher_my_classroom_list=\n${JSON.stringify(teacher_my_classroom_list)}`);
      },
      (json_error) => {}
    );
  }
</script>

<div class="container my-3">
  <h5 class="my-3 border-bottom pb-2">학생 학습모듈 관리</h5>
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
    <table class="table">
      <thead>
        <tr class="text-center table-dark">
          <th>순번</th>
          <th>아이디</th>
          <th>이름</th>
          <th>학습모듈</th>
          <th>상태</th>
          <th style="width:200px;">&nbsp;</th>
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
            <td>
              {#if classroom.classroom_status > 0}
                <a
                  use:link
                  href="/edu-student-classroom-viewscore/{classroom.userid}/{classroom.classroom_idx}"
                  class="btn btn-sm btn-primary">채점하기</a
                >
              {/if}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  {:catch}
    Error
  {/await}
</div>

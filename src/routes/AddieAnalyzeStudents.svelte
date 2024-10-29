<script>
  import fastapi from "../lib/api";
  import { link, push } from "svelte-spa-router";
  import { access_token, userid } from "../lib/store";
  // import moment from "moment/min/moment-with-locales";
  // SVGAnimateMotionElement.locale("ko");

  let teacher_my_classroom_list = [];
  let teacher_student_dict = {};
  let teacher_classroom_dict = {};
  let student_list = [];
  let classroom_list = {};
  let size = 20;
  let total = 0;

  function get_teacher_student_classrooms(teacherid) {
    fastapi(
      "get",
      `/edu/teacher/${teacherid}/classroom/list`,
      {},
      (json) => {
        // console.log(`teacherid=${$userid}`);
        student_list = json.student_list;
        // console.log(`student_list=\n${JSON.stringify(student_list)}`);
        for (let i = 0; i < json.classroom_list.length; i++) {
          let obj = json.classroom_list[i];
          classroom_list[obj["idx"]] = obj;
        }
        // console.log( `classroom_dict=\n${JSON.stringify(classroom_list)}`);
      },
      (json_error) => {}
    );
  }
</script>

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
{:then}
  <div class="container my-3">
    <h5 class="my-3 border-bottom pb-2">학생 목록</h5>
    <table class="table">
      <thead>
        <tr class="text-center table-dark">
          <th>순번</th>
          <th>아이디</th>
          <th>이름</th>
          <th>학습모듈</th>
          <th style="width:200px;">&nbsp;</th>
        </tr>
      </thead>
      <tbody>
        {#each student_list as student, i}
          <tr class="text-center">
            <td>{i + 1}</td>
            <td>{student.userid}</td>
            <td>{student.username}</td>
            <td>
              {#if student.current_classroom == 0}
                선택안함
              {:else}
                {student.current_classroom}. {classroom_list[
                  student.current_classroom
                ].title}
              {/if}
            </td>
            <td>
              <a
                use:link
                href="/edu-student-view/{student.userid}"
                class="btn btn-sm btn-outline-secondary">보기</a
              >
              <a
                use:link
                href="/edu-student-update/{student.userid}"
                class="btn btn-sm btn-outline-primary">수정</a
              >
              <a href={"#"} class="btn btn-sm btn-outline-danger">삭제</a>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
{/await}

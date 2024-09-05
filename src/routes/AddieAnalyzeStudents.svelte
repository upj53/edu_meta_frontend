<script>
    import fastapi from "../lib/api";
    import { link, push } from "svelte-spa-router";
    import { access_token, userid } from "../lib/store";
    // import moment from "moment/min/moment-with-locales";
    // SVGAnimateMotionElement.locale("ko");

    let student_list = [];
    let classroom_list = {};
    let size = 20;
    let total = 0;

    function get_student_list() {
        let params = {
            page: 0,
            size: size,
        };
        fastapi(
            "get",
            "/edu/student/list",
            params,
            (json1) => {
                fastapi(
                    "get",
                    "/edu/develop/classroom/list",
                    {},
                    (json2) => {
                        for (let i = 0; i < json2.classroom_list.length; i++) {
                            let obj = json2.classroom_list[i];
                            classroom_list[obj["idx"]] = obj;
                        }
                        // console.log(JSON.stringify(classroom_list));
                        student_list = json1.student_list;
                        total = json1.total;
                    },
                    (json2_error) => {},
                );
            },
            (json1_error) => {},
        );
    }
    get_student_list();
</script>

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
                    <td>{i+1}</td>
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
                        <a href={"#"} class="btn btn-sm btn-outline-danger"
                            >삭제</a
                        >
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
</div>

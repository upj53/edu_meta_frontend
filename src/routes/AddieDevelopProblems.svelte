<script>
    import { link } from "svelte-spa-router";
    import fastapi from "../lib/api";

    let problem_list = [];

    function get_problem_list() {
        let params = {};
        fastapi(
            "get",
            "/edu/develop/problem/list",
            params,
            (json1) => {
                fastapi(
                    "get",
                    "/edu/design/object/list",
                    {},
                    (json2) => {
                        let object_list = {};
                        let obj_list = json2.object_list;
                        for (let i = 0; i < obj_list.length; i++) {
                            object_list[obj_list[i].idx] = obj_list[i];
                        }
                        problem_list = json1.problem_list;
                        // console.log(JSON.stringify(object_list));
                        for (let i = 0; i < problem_list.length; i++) {
                            let cls_idx = problem_list[i]["object_idx"];
                            problem_list[i]["object_title"] =
                                object_list[cls_idx]["object_title"];
                        }
                    },
                    (json2_error) => {},
                );
            },
            (json1_error) => {},
        );
    }

    get_problem_list();
</script>

<div class="container">
    <h5 class="my-3 border-bottom pb-2">문제 목록</h5>
    <table class="table">
        <thead>
            <tr class="text-center table-dark">
                <th>인덱스</th>
                <th>문제</th>
                <th>단계</th>
                <th>수업주제</th>
                <th style="width:200px;">&nbsp;</th>
            </tr>
        </thead>
        <tbody>
            {#each problem_list as problem}
                <tr class="text-center">
                    <td>{problem.idx}</td>
                    <td class="text-start"
                        ><p
                            style="width:450px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;"
                        >
                            {problem.problem_question}
                        </p></td
                    >
                    <td>{problem.problem_level}</td>
                    <td>
                        {problem.object_idx}.{problem.object_title}
                    </td>
                    <td>
                        <a
                            use:link
                            href="/edu-problem-view/{problem.idx}"
                            class="btn btn-sm btn-outline-secondary">보기</a
                        >
                        <a
                            use:link
                            href="/edu-problem-update/{problem.idx}"
                            class="btn btn-sm btn-outline-primary">수정</a
                        >
                        <a
                            href={null}
                            class="btn btn-sm btn-outline-danger"
                            on:click={() => {
                                alert("현재 비활성 상태입니다.");
                                return false;
                            }}>삭제</a
                        >
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
</div>

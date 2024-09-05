<script>
    import { link } from "svelte-spa-router";
    import fastapi from "../lib/api";

    let subject_list = [];

    function get_subject_list() {
        let params = {};
        fastapi(
            "get",
            "/edu/design/subject/list",
            params,
            (json) => {
                subject_list = json.subject_list;
            },
            (json_error) => {},
        );
    }
    get_subject_list();
</script>

<div class="container">
    <h5 class="my-3 border-bottom pb-2">교육과정 목록</h5>
    <table class="table">
        <thead>
            <tr class="text-center table-dark">
                <th>순번</th>
                <th>제목</th>
                <th style="width:200px;">&nbsp;</th>
            </tr>
        </thead>
        <tbody>
            {#each subject_list as subject, i}
                <tr class="text-center">
                    <td>{subject.idx}</td>
                    <td>{subject.subject_title}</td>
                    <td>
                        <a
                            use:link
                            href="/edu-subject-view/{subject.idx}"
                            class="btn btn-sm btn-outline-secondary">보기</a
                        >
                        <a
                            href={null}
                            class="btn btn-sm btn-outline-primary"
                            on:click={() => {
                                alert("현재 비활성 상태입니다.");
                                return false;
                            }}>수정</a
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

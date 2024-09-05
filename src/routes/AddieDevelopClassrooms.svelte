<script>
    import { link } from "svelte-spa-router";
    import fastapi from "../lib/api";

    let classroom_list = [];

    function get_classroom_list() {
        let params = {};
        fastapi(
            "get",
            "/edu/develop/classroom/list",
            params,
            (json) => {
                classroom_list = json.classroom_list;
                // console.log(JSON.stringify(classroom_list));
            },
            (json_error) => {},
        );
    }
    get_classroom_list();
</script>

<div class="container">
    <div class="my-3 border-bottom pb-2">학습모듈 목록</div>
    <table class="table">
        <thead>
            <tr class="text-center table-dark">
                <td>순번</td>
                <td>제목</td>
                <td>문제</td>
                <td></td>
            </tr>
        </thead>
        <tbody>
            {#each classroom_list as classroom}
                <tr>
                    <td class="text-center align-middle">{classroom.idx}</td>
                    <td class="text-center align-middle">
                        <span style="font-weight:bold;">{classroom.title}</span>
                        <br />
                        {#if classroom.score_is_show == 0}
                            <span style="color:darkred;"
                                >(실시간 채점결과 비공개)</span
                            >
                        {:else if classroom.score_is_show == 1}
                            <span style="color:mediumblue;"
                                >(실시간 채점결과 공개)</span
                            >
                        {/if}
                    </td>
                    <td class="align-middle">
                        <ul>
                            <li>
                                1단계 문제: {classroom.level_1_problems} / 배점:
                                {classroom.level_1_problems_scores}(점)
                            </li>
                            <li>
                                2단계 문제: {classroom.level_2_problems} / 배점:
                                {classroom.level_2_problems_scores}(점)
                            </li>
                            <li>
                                3단계 문제: {classroom.level_3_problems} / 배점:
                                {classroom.level_3_problems_scores}(점)
                            </li>
                        </ul>
                        <span class="ms-5">총점: {classroom.total_score}점</span
                        >
                    </td>
                    <td class="text-center align-middle">
                        <a
                            use:link
                            href="/edu-classroom-view/{classroom.idx}"
                            class="btn btn-sm btn-outline-secondary">보기</a
                        ><br />
                        <a
                            use:link
                            href="/edu-classroom-update/{classroom.idx}"
                            class="btn btn-sm btn-outline-primary mt-1">수정</a
                        ><br />
                        <a
                            href={null}
                            on:click={() => {
                                alert("현재 비활성 상태입니다.");
                                return false;
                            }}
                            class="btn btn-sm btn-outline-danger mt-1">삭제</a
                        >
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
</div>

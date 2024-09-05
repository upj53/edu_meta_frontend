<script>
    import { link, push } from "svelte-spa-router";
    import { marked } from "marked";
    import fastapi from "../lib/api";

    let error = { detail: [] };

    export let params = {};
    let problem_idx = params.idx;

    let object_list = [];
    let problem = {};
    let level_2_answer_list = [
        ["", "", "", "", ""],
        ["", "", "", "", ""],
        ["", "", "", "", ""],
        ["", "", "", "", ""],
        ["", "", "", "", ""],
    ];
    let level_2_answer_list_length = [0, 0, 0, 0, 0];
    let level_2_initcodes_replace = "";
    let level_2_scores_precent = [];
    let level_3_problem_answer_list = ["", "", "", "", ""];
    let level_3_problem_answer_list_length = 0;

    function isOkScorePercent(event) {
        event.preventDefault();
        let result = true;
        if (problem.level_2_num_of_answers > 0) {
            let total = 0;
            for (let i = 0; i < level_2_scores_precent.length; i++) {
                total += level_2_scores_precent[i];
            }
            if (total != 100) {
                alert(
                    "배점 비율의 총합이 100% 가 아닙니다.\n비율을 조절해주세요.",
                );
                result = false;
            }
        }
        return result;
    }

    function updateProblem_reload(event) {
        if (isOkScorePercent(event)) {
            updateProblem();
            getProblemObjectList();
        }
    }

    function updateProblem() {
        switch (problem.problem_level) {
            case 2:
                if (problem.level_2_num_of_answers > 0) {
                    let total = 0;
                    for (let i = 0; i < level_2_scores_precent.length; i++) {
                        total += level_2_scores_precent[i];
                    }
                    if (total != 100) {
                        alert(
                            "배점 비율의 총합이 100% 가 아닙니다.\n비율을 조절해주세요.",
                        );
                        return false;
                    }
                    for (let i = 0; i < problem.level_2_num_of_answers; i++) {
                        let answer_list = [];
                        for (
                            let j = 0;
                            j < level_2_answer_list[i].length;
                            j++
                        ) {
                            if (level_2_answer_list[i][j].trim() != "") {
                                answer_list.push(level_2_answer_list[i][j]);
                            }
                        }
                        let this_item = `level_2_answer_${i + 1}`;
                        problem[this_item] = answer_list;
                    }
                    problem.level_2_scores_precent = level_2_scores_precent;
                }
                break;
            case 3:
                let answer_list = [];
                for (let i = 0; i < level_3_problem_answer_list.length; i++) {
                    if (level_3_problem_answer_list[i].trim() != "") {
                        answer_list.push(level_3_problem_answer_list[i]);
                    }
                }
                problem.problem_answer = answer_list;
                break;
        }
        fastapi(
            "put",
            `/edu/develop/update/problem/${problem_idx}`,
            problem,
            (json) => {
                alert("문제 정보를 성공적으로 수정했습니다.");
            },
            (json_error) => {},
        );
    }

    function updateInitCodePreview() {
        if (problem.problem_level == 2) {
            level_2_initcodes_replace = problem["level_2_initcodes"]
                .replace(
                    `II문제1번II`,
                    `<img alt="문제-1번" src="https://github.com/upj53/shared/assets/27456270/cc527243-eff8-4629-a04f-412e5d8e3f78" style="height:20px; width:auto;"/>`,
                )
                .replace(
                    `II문제2번II`,
                    `<img alt="문제-2번" src="https://github.com/upj53/shared/assets/27456270/ff11d2ca-ea46-41a8-8822-127d48391746" style="height:20px; width:auto;"/>`,
                )
                .replace(
                    `II문제3번II`,
                    `<img alt="문제-3번" src="https://github.com/upj53/shared/assets/27456270/31518e8d-9c41-4f77-ad47-81225d736c2d" style="height:20px; width:auto;"/>`,
                )
                .replace(
                    `II문제4번II`,
                    `<img alt="문제-4번" src="https://github.com/upj53/shared/assets/27456270/6bb0400c-7b2f-43ec-b782-6c5b7f2508d1" style="height:20px; width:auto;"/>`,
                )
                .replace(
                    `II문제5번II`,
                    `<img alt="문제-5번" src="https://github.com/upj53/shared/assets/27456270/277fc7d0-98d8-40e2-8285-b436b6ba13eb" style="height:20px; width:auto;"/>`,
                );
        }
    }

    async function getProblemObjectList() {
        await fastapi(
            "get",
            "/edu/design/object/list",
            {},
            (json1) => {
                fastapi(
                    "get",
                    `/edu/develop/problem/${problem_idx}`,
                    {},
                    (json2) => {
                        object_list = json1.object_list;
                        problem = json2;
                        updateInitCodePreview();
                        switch (problem.problem_level) {
                            case 2:
                                if (problem.level_2_num_of_answers > 0) {
                                    for (
                                        let i = 0;
                                        i < problem.level_2_num_of_answers;
                                        i++
                                    ) {
                                        let this_item = `level_2_answer_${i + 1}`;
                                        let num_of_answers = 0;
                                        for (
                                            let j = 0;
                                            j < problem[this_item].length;
                                            j++
                                        ) {
                                            level_2_answer_list[i][j] =
                                                problem[this_item][j];
                                            if (problem[this_item][j] != "")
                                                num_of_answers++;
                                        }
                                        level_2_answer_list_length[i] =
                                            num_of_answers;
                                    }
                                    if (
                                        problem.level_2_scores_precent.length ==
                                        problem.level_2_num_of_answers
                                    ) {
                                        level_2_scores_precent =
                                            problem.level_2_scores_precent;
                                    } else {
                                        let score_percent_per_answer =
                                            100 /
                                            problem.level_2_num_of_answers;
                                        let tmp = [];
                                        let total = 0;
                                        for (
                                            let i = 0;
                                            i <
                                            problem.level_2_num_of_answers - 1;
                                            i++
                                        ) {
                                            let num = Math.floor(
                                                score_percent_per_answer,
                                            );
                                            total += num;
                                            tmp.push(num);
                                        }
                                        tmp[
                                            problem.level_2_num_of_answers - 1
                                        ] = 100 - total;
                                        level_2_scores_precent = tmp;
                                        // console.log( `level_2_scores_precent=${JSON.stringify(level_2_scores_precent)}`,);
                                    }
                                }
                                break;
                            case 3:
                                if (problem.problem_answer.length > 0) {
                                    level_3_problem_answer_list_length = 0;
                                    for (
                                        let i = 0;
                                        i < problem.problem_answer.length;
                                        i++
                                    ) {
                                        if (problem.problem_answer[i] != "") {
                                            level_3_problem_answer_list[i] =
                                                problem.problem_answer[i];
                                            level_3_problem_answer_list_length++;
                                        }
                                    }
                                }
                                break;
                        }
                        // console.log(`object_list=\n${JSON.stringify(object_list)}`,);
                        // console.log(`problem=\n${JSON.stringify(problem)}`);
                        // console.log( `level_2_answer_list_length=${JSON.stringify(level_2_answer_list_length)}`,);
                    },
                    (json2_error) => {},
                );
            },
            (json1_error) => {},
        );
    }
</script>

<div class="container">
    {#await getProblemObjectList()}
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
        <form method="post">
            <h5 class="mt-3 border-bottom pb-2">
                {#if problem.problem_level === 1}1단계. 객관식 문제{/if}
                {#if problem.problem_level === 2}2단계. 주관식 문제{/if}
                {#if problem.problem_level === 3}3단계. 실습형 문제{/if}
            </h5>

            <h6>수업주제 분류</h6>
            <select
                class="form-select"
                aria-label="Default select example"
                bind:value={problem.object_idx}
                id="object_idx"
            >
                <option value="0">-----미분류-----</option>
                {#each object_list as object}
                    <option value={object.idx}
                        >{object.idx}. {object.object_title}</option
                    >
                {/each}
            </select>

            <div class="my-4">
                <label for="" class="fw-bold">문제의 질문</label>
                <textarea
                    placeholder=""
                    class="form-control fw-bold"
                    rows="3"
                    bind:value={problem.problem_question}
                ></textarea>
            </div>

            <div class="my-4">
                <label for="">문제 내용 상세 @markdown</label>
                <textarea
                    placeholder=""
                    class="form-control fw-bold"
                    rows="3"
                    bind:value={problem.problem_content}
                ></textarea>
            </div>

            {#if problem.problem_level >= 2}
                <div class="my-4">
                    <label for="">실행 결과 @markdown</label>
                    <textarea
                        placeholder=""
                        class="form-control"
                        rows="3"
                        bind:value={problem.problem_result}
                    ></textarea>
                </div>
            {/if}

            {#if problem.problem_level === 2}
                <div class="my-4">
                    <label for="">문제 코드</label>
                    <div class="alert alert-success mt-3">
                        문제의 빈칸은 &nbsp;&nbsp;&nbsp; II문제1번II
                        &nbsp;&nbsp;&nbsp; II문제2번II &nbsp;&nbsp;&nbsp;
                        II문제3번II &nbsp;&nbsp;&nbsp; II문제4번II
                        &nbsp;&nbsp;&nbsp; II문제5번II<br /> 으로 작성해주세요. II문제II는
                        영어 대문자 I 를 사용합니다. 필요시 복사 붙여넣기 해서 사용해도
                        됩니다.
                    </div>
                    <textarea
                        placeholder=""
                        class="form-control"
                        rows="3"
                        bind:value={problem.level_2_initcodes}
                        on:change={updateInitCodePreview}
                    ></textarea>
                </div>
                <div class="my-4">
                    <h6>문제 코드 미리보기</h6>
                    <div style="white-space:pre-wrap;">
                        {@html marked.parse(level_2_initcodes_replace)}
                    </div>
                </div>
            {/if}

            {#if problem.problem_level === 1}
                <div class="my-4">
                    <h6 class="fw-bold">객관식 문항</h6>
                    <div class="alert alert-success mt-3">
                        답안 문항을 포함한 총 4개의 문항을 입력해주세요.
                        사용자에게는 문항의 순서가 랜덤으로 섞여서 표시됩니다.
                    </div>
                    <ul class="list-group">
                        <li class="list-group-item">
                            <label for="problem_title" class="fw-bold"
                                >답안 문항</label
                            >
                            <input
                                placeholder="답안 문항을 입력해주세요."
                                type="text"
                                class="form-control fw-bold"
                                bind:value={problem.level_1_selection_answer}
                            />
                        </li>
                        <li class="list-group-item">
                            <label for="problem_title">다른 문항 1</label>
                            <input
                                placeholder="다른 문항을 입력해주세요."
                                type="text"
                                class="form-control"
                                bind:value={problem.level_1_selection_1}
                            />
                        </li>
                        <li class="list-group-item">
                            <label for="problem_title">다른 문항 2</label>
                            <input
                                placeholder="다른 문항을 입력해주세요."
                                type="text"
                                class="form-control"
                                bind:value={problem.level_1_selection_2}
                            />
                        </li>
                        <li class="list-group-item">
                            <label for="problem_title">다른 문항 3</label>
                            <input
                                placeholder="다른 문항을 입력해주세요."
                                type="text"
                                class="form-control"
                                bind:value={problem.level_1_selection_3}
                            />
                        </li>
                    </ul>
                </div>
            {:else if problem.problem_level === 2}
                <div class="my-3 pb-3">
                    <div class="mb-3">
                        <label for="exampleInputPassword1" class="form-label"
                            >주관식 문항의 수</label
                        >
                        <button
                            type="submit"
                            class="btn btn-success my-3"
                            on:click={updateProblem_reload}
                            >문항수 수정하기</button
                        >
                        <input
                            type="number"
                            class="form-control"
                            id="exampleInputPassword1"
                            min="0"
                            max="5"
                            bind:value={problem.level_2_num_of_answers}
                        />
                    </div>
                    <div style="width:100%;">
                        <h6 class="ms-3">배점 비율 (전체 100%)</h6>
                        <div class="d-flex">
                            {#each Array(problem.level_2_num_of_answers) as _, idx}
                                <div class="form-floating mb-3 ms-3">
                                    <input
                                        type="number"
                                        class="form-control"
                                        bind:value={level_2_scores_precent[idx]}
                                    />
                                    <label for=""
                                        >문제 {idx + 1}번 배점 비율 (%)</label
                                    >
                                </div>
                            {/each}
                        </div>
                    </div>
                    <div id="problem_level_2_answers">
                        {#if !problem.level_2_num_of_answers || problem.level_2_num_of_answers > 0}
                            {#each Array(problem.level_2_num_of_answers) as _, problem_idx}
                                <h6 class="mt-4 fw-bold">
                                    문제 {problem_idx + 1}번 모범 답안
                                </h6>
                                {@const problem_answers =
                                    problem[
                                        `level_2_answer_${problem_idx + 1}`
                                    ]}
                                <ul class="list-group">
                                    {#each Array(level_2_answer_list_length[problem_idx] + 1) as _, answer_idx}
                                        {#if answer_idx < 5}
                                            <li class="list-group-item">
                                                <div class="mb-2">
                                                    <label
                                                        for=""
                                                        class="form-label"
                                                        >문제 {problem_idx + 1} 답안
                                                        예시 ({answer_idx +
                                                            1})</label
                                                    >
                                                    <input
                                                        class="form-control"
                                                        bind:value={level_2_answer_list[
                                                            problem_idx
                                                        ][answer_idx]}
                                                        placeholder="추가할 답안 예시가 있으면 작성 후 수정해주세요."
                                                    />
                                                </div>
                                            </li>
                                        {/if}
                                    {/each}
                                </ul>
                            {/each}
                        {/if}
                    </div>
                </div>
            {:else if problem.problem_level === 3}
                <div class="my-3 pb-3">
                    <h6>답안 코드</h6>
                    {#each Array(level_3_problem_answer_list_length + 1) as _, answer_idx}
                        {#if answer_idx < 5}
                            <div class="my-4">
                                <label for=""
                                    >답안 코드 예시 ({answer_idx + 1})</label
                                >
                                <textarea
                                    placeholder=""
                                    class="form-control"
                                    rows="3"
                                    bind:value={level_3_problem_answer_list[
                                        answer_idx
                                    ]}
                                ></textarea>
                            </div>
                        {/if}
                    {/each}
                </div>
            {/if}

            <button
                type="submit"
                class="btn btn-primary my-3"
                on:click={updateProblem_reload}>수정하기</button
            >
            <a
                use:link
                href="/edu-problems"
                class="btn btn-primary my-3">목록</a
            >
        </form>
    {/await}
</div>

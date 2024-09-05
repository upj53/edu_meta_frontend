<script>
    import { link, push } from "svelte-spa-router";
    import { marked } from "marked";
    import fastapi from "../lib/api";
    import Error from "../components/Error.svelte";
    import { userid, student_current_classroom } from "../lib/store";

    let error = { detail: [] };
    let error_message = "";
    let success_message = "";

    let classroom = {};
    let myclassroom = {};
    let answers = {};
    let problems = {};
    let problem_scores = [];
    let level_2_problems_sub_scores = {};
    let num_of_problems = 0;
    let total_score = 0;

    function get_level_2_initcodes_replace(code) {
        let level_2_initcodes_replace = code
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
        return level_2_initcodes_replace;
    }

    function setProblemScores() {
        problem_scores = [];
        //level_1_problems_scores
        for (let i = 0; i < classroom.level_1_problems_scores.length; i++) {
            problem_scores.push(Number(classroom.level_1_problems_scores[i]));
        }
        for (let i = 0; i < classroom.level_2_problems_scores.length; i++) {
            problem_scores.push(Number(classroom.level_2_problems_scores[i]));
        }
        for (let i = 0; i < classroom.level_3_problems_scores.length; i++) {
            problem_scores.push(Number(classroom.level_3_problems_scores[i]));
        }
        // console.log(`problem_scores=${JSON.stringify(problem_scores)}`);
        let i = 0;
        for (const [key, problem] of Object.entries(problems)) {
            let seq = Number(key);
            if (problem.problem_level == 2) {
                let problem_score = problem_scores[i];
                let tmp = [];
                let total = 0;
                for (
                    let i = 0;
                    i < problem.level_2_scores_precent.length - 1;
                    i++
                ) {
                    let per = problem.level_2_scores_precent[i];
                    tmp[i] = Math.floor(problem_score * per * 0.01);
                    total += tmp[i];
                }
                tmp[problem.level_2_scores_precent.length - 1] =
                    problem_score - total;
                level_2_problems_sub_scores[seq] = tmp;
            }
            i++;
        }
        // console.log( `level_2_problems_sub_scores=\n${JSON.stringify(level_2_problems_sub_scores)}`,);
    }

    async function getMyClassroomAll() {
        if ($student_current_classroom == 0) {
            // error_message = `클래스룸 학습설정이 완료되어 있지 않습니다. "학습설정" 메뉴에서 학습할 주제를 선택해주세요.`;
            return false;
        } else {
            error_message = "";
        }
        await fastapi(
            "get",
            `/edu/student/answer/list/${$userid}/${$student_current_classroom}`,
            {},
            (json) => {
                classroom = json.classroom;
                myclassroom = json.my_classroom;
                if (myclassroom.classroom_status == 0) {
                    error_message =
                        "아직 학습이 완료되지 않았습니다.<br>학습 완료 후 제출 버튼을 눌러주세요.";
                    return false;
                }
                // answer_list = json.my_answer_list;
                // problem_list = json.problem_list;
                for (let i = 0; i < json.my_answer_list.length; i++) {
                    let obj = json.my_answer_list[i];
                    answers[`${i + 1}`] = obj;
                }
                for (let i = 0; i < json.problem_list.length; i++) {
                    let obj = json.problem_list[i];
                    problems[`${i + 1}`] = obj;
                }
                num_of_problems = json.num_of_problems;
                setProblemScores();
                // current_problem_seq = json.current_problem_seq;
                // current_problem_idx = json.current_problem_idx;
                // console.log(`num_of_problems=${num_of_problems}`);
                // console.log("classroom=\n" + JSON.stringify(classroom));
                // console.log("myclassroom=\n" + JSON.stringify(myclassroom));
                // console.log('my_answer_list=\n'+JSON.stringify(json.my_answer_list));
                // console.log('problem_list=\n'+JSON.stringify(json.problem_list));
                console.log("answers=\n" + JSON.stringify(answers));
                console.log("problems=\n" + JSON.stringify(problems));
                for (const [idx, answer] of Object.entries(answers)) {
                    total_score += answer.answer_score;
                }
            },
            {},
        );
    }
</script>

<div class="container">
    <Error {error} />
    {#if error_message}
        <div class="alert alert-danger mt-3">{@html error_message}</div>
    {/if}
    {#if success_message}
        <div class="alert alert-success mt-3">{@html success_message}</div>
    {/if}
    {#if myclassroom.classroom_status != 0 && $student_current_classroom != 0}
        {#await getMyClassroomAll()}
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
            <h5 class="mt-3 pb-2">학습결과 보고서</h5>
            <div class="accordion" id="accordionPanelsStayOpenExample">
                {#each Object.entries(answers) as [idx, answer]}
                    <div class="accordion-item">
                        <h2 class="accordion-header">
                            <button
                                class="accordion-button collapsed"
                                type="button"
                                data-bs-toggle="collapse"
                                data-bs-target="#score-result-panels-{idx}"
                                aria-expanded="false"
                                aria-controls="score-result-panels-{idx}"
                            >
                                <span class="fw-bold" style="width:110px;"
                                    >{idx}번 문제</span
                                >
                                {#if answer.answer_status == 1}
                                    <span class="ms-3">채점 미완료</span>
                                {:else if answer.answer_status == 2}
                                    <span class="ms-3">채점중</span>
                                {:else if answer.answer_status == 3}
                                    <span class="ms-3">채점 완료</span>
                                    <span class="ms-4 fw-bold"
                                        >{answers[idx].answer_score}점</span
                                    >
                                {/if}
                            </button>
                        </h2>
                        <div
                            id="score-result-panels-{idx}"
                            class="accordion-collapse collapse"
                        >
                            <div class="accordion-body">
                                {#if [1, 2].includes(answer.answer_status)}
                                    채점중입니다.
                                {:else if answer.answer_status >= 3}
                                    <div>
                                        <h6
                                            class="pt-1 pb-2"
                                            style="font-weight:bold; font-size:20px;"
                                        >
                                            [배점: {problem_scores[idx - 1]}점]
                                            {problems[idx]["problem_question"]}
                                        </h6>
                                        {#if problems[idx]["problem_content"]}
                                            <div class="my-3">
                                                {@html marked.parse(
                                                    problems[idx][
                                                        "problem_content"
                                                    ],
                                                )}
                                            </div>
                                        {/if}
                                        {#if problems[idx].problem_level == 1}
                                            <div class="my-3 pb-3">
                                                {#if answers[idx].is_correct_teacher[0] == 1}
                                                    <p>정답입니다.</p>
                                                {:else}
                                                    <p>오답입니다.</p>
                                                {/if}
                                                <ul class="list-group">
                                                    <form>
                                                        {#each answers[idx].selection_list as s, ans_idx}
                                                            <li
                                                                class="list-group-item"
                                                            >
                                                                {#if ans_idx + 1 == 1}
                                                                    <span
                                                                        >①</span
                                                                    >
                                                                {:else if ans_idx + 1 == 2}
                                                                    <span
                                                                        >②</span
                                                                    >
                                                                {:else if ans_idx + 1 == 3}
                                                                    <span
                                                                        >③</span
                                                                    >
                                                                {:else if ans_idx + 1 == 4}
                                                                    <span
                                                                        >④</span
                                                                    >
                                                                {/if}
                                                                <div
                                                                    class="form-check align-top"
                                                                    style="display:inline-block;"
                                                                >
                                                                    {#if ans_idx + 1 == Number(answers[idx].answer[0])}
                                                                        <input
                                                                            class="form-check-input"
                                                                            type="radio"
                                                                            name="sel_list"
                                                                            value=""
                                                                            disabled
                                                                            checked
                                                                        />
                                                                    {:else}
                                                                        <input
                                                                            class="form-check-input"
                                                                            type="radio"
                                                                            name="sel_list"
                                                                            value=""
                                                                            disabled
                                                                        />
                                                                    {/if}
                                                                    <label
                                                                        for=""
                                                                        class="form-check-label"
                                                                        id="sel-1"
                                                                    >
                                                                        {#if s == 0}
                                                                            {problems[
                                                                                idx
                                                                            ]
                                                                                .level_1_selection_answer}
                                                                            <span
                                                                                style="color:red; margin-left:10px;"
                                                                                >(정답)</span
                                                                            >
                                                                        {:else if s == 1}
                                                                            {problems[
                                                                                idx
                                                                            ]
                                                                                .level_1_selection_1}
                                                                        {:else if s == 2}
                                                                            {problems[
                                                                                idx
                                                                            ]
                                                                                .level_1_selection_2}
                                                                        {:else if s == 3}
                                                                            {problems[
                                                                                idx
                                                                            ]
                                                                                .level_1_selection_3}
                                                                        {/if}
                                                                    </label>
                                                                </div>
                                                            </li>
                                                        {/each}
                                                    </form>
                                                </ul>
                                            </div>
                                            {#if answers[idx].comment_to_student[0] != ""}
                                                <div
                                                    class="alert alert-light"
                                                    role="alert"
                                                >
                                                    {answers[idx]
                                                        .comment_to_student[0]}
                                                </div>
                                            {/if}
                                        {:else if problems[idx].problem_level == 2}
                                            <h6 class="pt-2">파이썬 코드</h6>
                                            <div style="white-space:pre-wrap;">
                                                {@html marked.parse(
                                                    get_level_2_initcodes_replace(
                                                        problems[idx]
                                                            .level_2_initcodes,
                                                    ),
                                                )}
                                            </div>

                                            <h6 class="pt-4">실행 결과</h6>
                                            {@html marked.parse(
                                                problems[idx].problem_result,
                                            )}

                                            <h6 class="pt-4">
                                                주관식 문제 답안
                                            </h6>
                                            {#each Array(problems[idx].level_2_num_of_answers) as _, prob_idx}
                                                <div class="mb-3">
                                                    <label
                                                        for=""
                                                        class="form-label fw-bold"
                                                    >
                                                        {#if `${idx}` in level_2_problems_sub_scores}
                                                            [배점: {level_2_problems_sub_scores[
                                                                idx
                                                            ][prob_idx]}점] 문제 {prob_idx +
                                                                1}번
                                                        {/if}
                                                    </label>
                                                    <div>
                                                        {answers[idx].answer[
                                                            prob_idx
                                                        ]}
                                                    </div>
                                                    {#if answers[idx].is_correct_teacher[prob_idx] == 1}
                                                        <p>정답입니다.</p>
                                                    {:else if answers[idx].is_correct_teacher[prob_idx] == 0}
                                                        <p>오답입니다.</p>
                                                        <p>정답 예시</p>
                                                        <ul>
                                                            {#if prob_idx + 1 == 1}
                                                                {#each problems[idx].level_2_answer_1 as a}
                                                                    <li>{a}</li>
                                                                {/each}
                                                            {:else if prob_idx + 1 == 2}
                                                                {#each problems[idx].level_2_answer_2 as a}
                                                                    <li>{a}</li>
                                                                {/each}
                                                            {:else if prob_idx + 1 == 3}
                                                                {#each problems[idx].level_2_answer_3 as a}
                                                                    <li>{a}</li>
                                                                {/each}
                                                            {/if}
                                                        </ul>
                                                    {/if}
                                                    {#if answers[idx].comment_to_student[prob_idx] != ""}
                                                        <div
                                                            class="alert alert-light"
                                                            role="alert"
                                                        >
                                                            {answers[idx]
                                                                .comment_to_student[
                                                                prob_idx
                                                            ]}
                                                        </div>
                                                    {/if}
                                                </div>
                                            {/each}
                                        {:else if problems[idx].problem_level == 3}
                                            <h6 class="pt-3">파이썬 코드</h6>
                                            <div class="mb-3">
                                                <textarea
                                                    name=""
                                                    id="python-editor"
                                                    class="form-control"
                                                    rows="10"
                                                    bind:value={answers[idx]
                                                        .answer[0]}
                                                    disabled
                                                ></textarea>
                                            </div>
                                            {#if answers[idx].is_correct_teacher[0] == 1}
                                                <p>정답입니다.</p>
                                                <p>또 다른 정답 예시</p>
                                                {#if problems[idx].problem_answer.length > 0}
                                                    {#each problems[idx].problem_answer as pa}
                                                        {#if pa != ""}
                                                            {@html marked.parse(
                                                                pa,
                                                            )}
                                                        {/if}
                                                    {/each}
                                                {/if}
                                            {:else}
                                                <p>오답입니다.</p>
                                                <p>정답 예시</p>
                                                {#if problems[idx].problem_answer.length > 0}
                                                    {#each problems[idx].problem_answer as pa}
                                                        {#if pa != ""}
                                                            {@html marked.parse(
                                                                pa,
                                                            )}
                                                        {/if}
                                                    {/each}
                                                {/if}
                                            {/if}
                                            {#if answers[idx].comment_to_student[0] != ""}
                                                <div
                                                    class="alert alert-light"
                                                    role="alert"
                                                >
                                                    {answers[idx]
                                                        .comment_to_student[0]}
                                                </div>
                                            {/if}
                                        {/if}
                                    </div>
                                {/if}
                            </div>
                        </div>
                    </div>
                {/each}
            </div>
            {#if myclassroom.classroom_status == 2}
                <div class="mt-3 pb-5">
                    <div class="alert alert-warning" role="alert">
                        현재 채점중입니다. 채점이 완료될 때까지 기다려주세요.
                    </div>
                </div>
            {:else if myclassroom.classroom_status == 3}
                <h5 class="mt-3 ps-5">총점: <b>{total_score}</b>점</h5>
                <div class="pb-5">
                    {#if total_score == 100}
                        <div class="alert alert-success" role="alert">
                            참 잘했습니다. 총점이 100점 이상입니다. 학습 정리를
                            통해 학습을 마무리 해주세요.
                        </div>
                        <button
                            class="btn btn-success"
                            on:click={() => {
                                push("/classroom-summary");
                            }}>학습 정리</button
                        >
                    {:else if total_score >= 90}
                        <div class="alert alert-success" role="alert">
                            참 잘했습니다. 총점이 90점 이상입니다. 학습 정리를
                            통해 틀린 문제를 학습하세요.
                        </div>
                        <button
                            class="btn btn-success"
                            on:click={() => {
                                push("/classroom-summary");
                            }}>학습 정리</button
                        >
                    {:else if total_score >= 70}
                        <div class="alert alert-primary" role="alert">
                            총점이 70점 이상 90점 미만이면 틀린 문제에 대한
                            학습을 완료해야 해당 과정이 이수됩니다.
                        </div>
                        <button
                            class="btn btn-primary"
                            on:click={() => {
                                push("/classroom-review");
                            }}>오답 학습</button
                        >
                    {:else}
                        <div class="alert alert-danger" role="alert">
                            총점이 70점 미만이면 이전 학습단계로 돌아가서
                            선수학습을 완료해야 해당 과정이 이수됩니다.
                        </div>
                        <button
                            class="btn btn-danger"
                            on:click={() => {
                                push("/previous-classroom");
                            }}>선수학습 시작하기</button
                        >
                    {/if}
                </div>
            {/if}
        {/await}
    {:else}
        <!-- <div class="alert alert-danger"></div> -->
    {/if}
</div>

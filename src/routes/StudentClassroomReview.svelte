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
    let num_of_problems = 0;
    let problem_scores = [];
    let level_2_problems_sub_scores = {};
    let total_score = 0;

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
    }

    async function getMyClassroomAll() {
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
                // current_problem_seq = json.current_problem_seq;
                // current_problem_idx = json.current_problem_idx;
                // console.log(`num_of_problems=${num_of_problems}`);
                // console.log("classroom=\n" + JSON.stringify(classroom));
                // console.log("myclassroom=\n" + JSON.stringify(myclassroom));
                // console.log('my_answer_list=\n'+JSON.stringify(json.my_answer_list));
                // console.log('problem_list=\n'+JSON.stringify(json.problem_list));
                // console.log("answers=\n" + JSON.stringify(answers));
                // console.log("problems=\n" + JSON.stringify(problems));
                for (const [idx, answer] of Object.entries(answers)) {
                    total_score += answer.answer_score;
                }
                setProblemScores();
                for (let i = 0; i < json.problem_list.length; i++) {
                    let seq = i + 1;
                    let problem = json.problem_list[i];
                    if (problem.problem_level == 2) {
                        let problem_score = problem_scores[i];
                        // console.log(`${seq}번 ${problem_score}점`)
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
                }
                // console.log( `level_2_problems_sub_scores=\n${JSON.stringify(level_2_problems_sub_scores)}`,);
            },
            {},
        );
    }
</script>

<div class="container">
    <h5 class="mt-3 pb-2">오답 학습</h5>
    {#if myclassroom.classroom_status != 0}
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
            <div class="accordion" id="accordionPanelsStayOpenExample">
                {#each Object.entries(answers) as [idx, answer]}
                    {#if answer.answer_score < problem_scores[idx]}
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
                                    <span class="ps-3" style="width:140px;"
                                        >점수: <b style="color:red;"
                                            >{answer.answer_score}점</b
                                        >/{problem_scores[idx]}점</span
                                    >
                                </button>
                            </h2>
                            <div
                                id="score-result-panels-{idx}"
                                class="accordion-collapse show"
                            >
                                <div class="accordion-body">내용</div>
                            </div>
                        </div>
                    {/if}
                {/each}
            </div>
        {/await}
    {/if}
</div>

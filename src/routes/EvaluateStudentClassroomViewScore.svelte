<script>
    import { get } from "svelte/store";
    import { link, push } from "svelte-spa-router";
    import { marked } from "marked";
    import fastapi from "../lib/api";
    import Error from "../components/Error.svelte";
    import { userid } from "../lib/store";
    // import { lang } from "moment";

    // set variables
    let error = { detail: [] };
    let error_message = "";
    let success_message = "";
    let is_save = false;
    let has_changed = false;

    export let params = {};
    let student_userid = params.userid;
    let student_classroom_idx = params.classroom_idx;

    let student = {};
    let classroom = {};
    let myclassroom = {};
    let answers = {};
    let problems = {};
    let problem_dict = {};
    let problem = {};
    let problem_scores = [];
    let selections = ["", "", "", ""];
    let problem_question = "",
        problem_content = "",
        level_2_initcodes_replace = "";
    let answer = {};
    let my_answer = 0;
    let my_answers = ["", "", "", "", ""];
    let my_answers_progress_bar = [];
    let my_answers_scored_progress_bar = [];
    let num_of_problems = 0;
    let current_problem_seq = 1;
    let level_1_real_answer = 0;
    let level_1_is_correct = false;
    let level_1_is_correct_teacher = false;
    let level_2_real_answer_1 = [];
    let level_2_real_answer_2 = [];
    let level_2_real_answer_3 = [];
    let level_2_real_answer_4 = [];
    let level_2_real_answer_5 = [];
    let level_2_is_correct = [];
    let level_2_is_correct_teacher = [];
    let level_2_problems_sub_scores = {};
    let level_3_is_correct = false;
    let level_3_is_correct_teacher = false;
    let level_3_particial_score = 0;
    let level_3_real_answer = [];
    let comment_to_student = [];
    let memo_from_teacher = [];

    function runPython() {
        const out = document.getElementById("out");
        out.innerText = "";
        const editor = document.getElementById("python-editor");
        let code = editor.value;
        let code_final = `<py-script id="input" output="out" output-mode="replace">${code}</py-script>`;
        const py_container = document.getElementById("py-container");
        py_container.innerHTML = code_final;
    }

    function convertEditor(e) {
        if (e.keyCode === 9) {
            const editor = document.getElementById("python-editor");
            let start = editor.selectionStart;
            let end = editor.selectionEnd;
            let code = editor.value;
            editor.value = `${code.substring(0, start)}    ${code.substring(end)}`;
            editor.selectionStart = editor.selectionEnd = start + 4;
            e.preventDefault();
        }
    }

    function checkChanged() {
        if (has_changed) {
            if (
                confirm(
                    `${current_problem_seq}번 문제 채점 내용이 변경됐습니다.\n저장하시겠습니까?`,
                )
            ) {
                updateStudentAnswerScore();
            }
            has_changed = false;
        }
    }

    function updateStudentAnswerScore() {
        let update_answer = answer;
        update_answer.answer_status = 3;
        if (problem.problem_level == 1) {
            update_answer.is_correct_teacher = [
                level_1_is_correct_teacher ? 1 : 0,
            ];
            update_answer.comment_to_student = comment_to_student;
            update_answer.memo_from_teacher = memo_from_teacher;
            update_answer.answer_score = level_1_is_correct_teacher
                ? problem_scores[current_problem_seq - 1]
                : 0;
            // console.log(`배점=${problem_scores[current_problem_seq - 1]}\n
            // 이문제 맞았나?=${level_1_is_correct_teacher}\n
            // 점수=${update_answer.answer_score}`);
        } else if (problem.problem_level == 2) {
            let tmp = [];
            for (let i = 0; i < level_2_is_correct_teacher.length; i++) {
                tmp[i] = level_2_is_correct_teacher[i] ? 1 : 0;
            }
            update_answer.is_correct_teacher = tmp;
            update_answer.comment_to_student = comment_to_student;
            update_answer.memo_from_teacher = memo_from_teacher;
            let total = 0;
            for (let i = 0; i < level_2_is_correct_teacher.length; i++) {
                if (level_2_is_correct_teacher[i]) {
                    total +=
                        level_2_problems_sub_scores[current_problem_seq][i];
                }
            }
            update_answer.answer_score = total;
            // console.log(`배점=${JSON.stringify(level_2_problems_sub_scores[current_problem_seq])}\n
            // 이문제 맞았나?=${JSON.stringify(level_2_is_correct_teacher)}\n
            // 점수=${update_answer.answer_score}`);
        } else if (problem.problem_level == 3) {
            if (
                level_3_particial_score < 0 ||
                level_3_particial_score >
                    problem_scores[current_problem_seq - 1]
            ) {
                alert("부분점수가 잘못 입력됐습니다!\n다시 한번 확인해주세요.");
                return false;
            }
            update_answer.is_correct_teacher = [
                level_3_is_correct_teacher ? 1 : 0,
            ];
            update_answer.comment_to_student = comment_to_student;
            update_answer.memo_from_teacher = memo_from_teacher;
            if (level_3_is_correct_teacher) {
                update_answer.particial_score =
                    problem_scores[current_problem_seq - 1];
            } else {
                update_answer.particial_score = level_3_particial_score;
            }
            update_answer.answer_score = update_answer.particial_score;
            // console.log(`점수=${update_answer.answer_score}`);
        }
        answers[current_problem_seq] = update_answer;
        fastapi(
            "put",
            `/edu/student/update/answer/${answer.idx}`,
            update_answer,
            (json) => {
                has_changed = false;
                alert(`저장했습니다.`);
                getMyClassroomAll();
            },
            (json_error) => {},
        );
        // console.log( `update_answer=\n${JSON.stringify(answers[current_problem_seq])}`,);
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
    }

    function setProgressBar() {
        // for(const [k,v] of Object.entries(answers)) {
        // console.log(`k=${k}, v=${JSON.stringify(v)}`)
        // }
        for (let i = 0; i < num_of_problems; i++) {
            if (i + 1 in answers) {
                // console.log(`${i + 1}번 문제 답안이 있습니다.`);
                let answer = answers[i + 1];
                let has_answers = false;
                for (let j = 0; j < answer.answer.length; j++) {
                    if (answer.answer[j] != "") {
                        has_answers = true;
                        break;
                    }
                }
                if (has_answers) {
                    my_answers_progress_bar[i] = true;
                } else {
                    my_answers_progress_bar[i] = false;
                }
                my_answers_scored_progress_bar[i] = answer.answer_status;
            }
        }
        // console.log( `my_answers_progress_bar=\n${JSON.stringify(my_answers_progress_bar)}`,);
        // console.log( `my_answers_scored_progress_bar=\n${JSON.stringify(my_answers_scored_progress_bar)}`,);
    }

    function setProblem() {
        if (current_problem_seq != 0) {
            selections = ["", "", "", ""];
            my_answers = ["", "", "", "", ""];
            problem = problems[current_problem_seq];
            // console.log(`problem=\n${JSON.stringify(problem)}`);
            problem_question = problem["problem_question"];
            problem_content = problem["problem_content"];
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
            setMyAnswer();
        }
    }

    function setMyAnswer() {
        if (current_problem_seq != 0) {
            answer = answers[current_problem_seq];
            // console.log(`@setMyAnswer answer=\n${JSON.stringify(answer)}`);
            if (answer.answer.length > 0) {
                if (problem.problem_level == 1) {
                    my_answer = Number(answer.answer[0]);
                    level_1_real_answer = answer.selection_list.indexOf(0) + 1;
                    level_1_is_correct =
                        answer.is_correct[0] == 1 ? true : false;
                    if (answer.is_correct_teacher.length == 0) {
                        level_1_is_correct_teacher = level_1_is_correct;
                    } else {
                        level_1_is_correct_teacher =
                            answer.is_correct_teacher[0] == 1 ? true : false;
                    }
                    // console.log( `${answer.selection_list} 진짜 답=${answer.selection_list.indexOf(0) + 1}`,);
                    // console.log( `is_correct=${answer.is_correct[0]} ${level_1_is_correct}`,);
                    if (answer.comment_to_student.length == 0) {
                        comment_to_student[0] = "";
                    } else {
                        comment_to_student[0] = answer.comment_to_student[0];
                    }
                    if (answer.memo_from_teacher.length == 0) {
                        memo_from_teacher[0] = "";
                    } else {
                        memo_from_teacher[0] = answer.memo_from_teacher[0];
                    }
                } else if (problem.problem_level == 2) {
                    for (let i = 0; i < problem.level_2_num_of_answers; i++) {
                        my_answers[i] = answer.answer[i];
                    }
                    let is_correct = [];
                    for (let i = 0; i < problem.level_2_num_of_answers; i++) {
                        is_correct[i] =
                            answer.is_correct[i] == 1 ? true : false;
                    }
                    level_2_is_correct = is_correct;
                    if (answer.is_correct_teacher.length == 0) {
                        for (
                            let i = 0;
                            i < problem.level_2_num_of_answers;
                            i++
                        ) {
                            level_2_is_correct_teacher[i] =
                                level_2_is_correct[i];
                        }
                    } else {
                        is_correct = [];
                        for (
                            let i = 0;
                            i < answer.is_correct_teacher.length;
                            i++
                        ) {
                            is_correct[i] =
                                answer.is_correct_teacher[i] == 1
                                    ? true
                                    : false;
                        }
                        level_2_is_correct_teacher = is_correct;
                    }
                    for (let i = 0; i < problem.level_2_num_of_answers; i++) {
                        switch (i + 1) {
                            case 1:
                                level_2_real_answer_1 =
                                    problem.level_2_answer_1;
                                break;
                            case 2:
                                level_2_real_answer_2 =
                                    problem.level_2_answer_2;
                                break;
                            case 3:
                                level_2_real_answer_3 =
                                    problem.level_2_answer_3;
                                break;
                            case 4:
                                level_2_real_answer_4 =
                                    problem.level_2_answer_4;
                                break;
                            case 5:
                                level_2_real_answer_5 =
                                    problem.level_2_answer_5;
                                break;
                        }
                    }
                    // console.log(`is_correct=${level_2_is_correct}`);
                    // console.log(`level_2_real_answer_1=\n${JSON.stringify(level_2_real_answer_1)}`)
                    // console.log(`level_2_real_answer_2=\n${JSON.stringify(level_2_real_answer_2)}`)
                    // console.log(`level_2_real_answer_3=\n${JSON.stringify(level_2_real_answer_3)}`)
                    // console.log(`level_2_real_answer_4=\n${JSON.stringify(level_2_real_answer_4)}`)
                    // console.log(`level_2_real_answer_5=\n${JSON.stringify(level_2_real_answer_5)}`)
                    if (answer.comment_to_student.length == 0) {
                        let tmp = [];
                        for (
                            let i = 0;
                            i < problem.level_2_num_of_answers;
                            i++
                        ) {
                            tmp[i] = "";
                        }
                        comment_to_student = tmp;
                    } else {
                        for (
                            let i = 0;
                            i < problem.level_2_num_of_answers;
                            i++
                        ) {
                            comment_to_student[i] =
                                answer.comment_to_student[i];
                        }
                    }
                    if (answer.memo_from_teacher.length == 0) {
                        let tmp = [];
                        for (
                            let i = 0;
                            i < problem.level_2_num_of_answers;
                            i++
                        ) {
                            tmp[i] = "";
                        }
                        memo_from_teacher = tmp;
                    } else {
                        for (
                            let i = 0;
                            i < problem.level_2_num_of_answers;
                            i++
                        ) {
                            memo_from_teacher[i] = answer.memo_from_teacher[i];
                        }
                    }
                } else if (problem.problem_level == 3) {
                    my_answers[0] = answer.answer[0];
                    my_answers[1] = answer.answer[1];
                    if (answer.is_correct.length > 0) {
                        level_3_is_correct =
                            answer.is_correct[0] == 1 ? true : false;
                    } else {
                        level_3_is_correct = false;
                    }
                    if (answer.is_correct_teacher.length == 0) {
                        level_3_is_correct_teacher = level_3_is_correct;
                    } else {
                        level_3_is_correct_teacher =
                            answer.is_correct_teacher[0] == 1 ? true : false;
                    }
                }
                // level 3 real answer
                if (problem.problem_answer.length != 0) {
                    for (let i = 0; i < problem.problem_answer.length; i++) {
                        level_3_real_answer[i] = problem.problem_answer[i];
                    }
                }
                // comment and memo
                if (answer.comment_to_student.length == 0) {
                    comment_to_student[0] = "";
                } else {
                    comment_to_student[0] = answer.comment_to_student[0];
                }
                if (answer.memo_from_teacher.length == 0) {
                    memo_from_teacher[0] = "";
                } else {
                    memo_from_teacher[0] = answer.memo_from_teacher[0];
                }
                level_3_particial_score = answer.particial_score;
            }
            if (answer.selection_list.length > 0) {
                // console.log(`selection_list=\n${answer.selection_list}`);
                for (let i = 0; i < answer.selection_list.length; i++) {
                    let sel_val = answer.selection_list[i];
                    switch (sel_val) {
                        case 0:
                            selections[i] = problem.level_1_selection_answer;
                            break;
                        case 1:
                            selections[i] = problem.level_1_selection_1;
                            break;
                        case 2:
                            selections[i] = problem.level_1_selection_2;
                            break;
                        case 3:
                            selections[i] = problem.level_1_selection_3;
                            break;
                    }
                }
            }
        }
    }

    function submitMyClassroom() {
        fastapi(
            "put",
            `/edu/evaluate/update/classroom/${myclassroom.idx}`,
            {},
            (json) => {
                alert("채점을 완료하였습니다.");
            },
            (json_error) => {},
        );
    }

    async function getMyClassroomAll() {
        await fastapi(
            "get",
            `/edu/student/answer/list/${student_userid}/${student_classroom_idx}`,
            {},
            (json) => {
                student = json.student;
                classroom = json.classroom;
                myclassroom = json.my_classroom;
                for (let i = 0; i < json.my_answer_list.length; i++) {
                    let obj = json.my_answer_list[i];
                    answers[`${i + 1}`] = obj;
                }
                for (let i = 0; i < json.problem_list.length; i++) {
                    let obj = json.problem_list[i];
                    problems[`${i + 1}`] = obj;
                    problem_dict[obj.idx] = obj;
                }
                num_of_problems = json.num_of_problems;
                // console.log("student=\n" + JSON.stringify(student));
                // console.log("classroom=\n" + JSON.stringify(classroom));
                // console.log("myclassroom=\n" + JSON.stringify(myclassroom));
                // console.log( "@getMyClassroomAll answers=\n" + JSON.stringify(answers[current_problem_seq]),);
                // console.log( "@getMyClassroomAll answers=\n" + JSON.stringify(answers),);
                // console.log("problems=\n" + JSON.stringify(problems));
                // console.log("problem_dict=\n" + JSON.stringify(problem_dict));
                setProgressBar();
                setProblem();
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
    <Error {error} />
    {#if error_message}
        <div class="alert alert-danger mt-3">{error_message}</div>
    {/if}
    {#if success_message}
        <div class="alert alert-success mt-3">{success_message}</div>
    {/if}
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
        <div
            class="progress-stacked"
            style="position:sticky; top:0px; z-index:9999; height:50px;"
        >
            {#each Array(my_answers_progress_bar.length) as _, idx}
                {#if my_answers_progress_bar[idx]}
                    <div
                        class="progress"
                        role="progressbar"
                        aria-label="Segment {idx + 1}"
                        aria-valuenow="10"
                        aria-valuemin="0"
                        aria-valuemax="100"
                        style="width: 10%; height:50px;"
                    >
                        <div class="progress-bar" id="progress-bar-{idx}">
                            {#if idx + 1 == current_problem_seq}
                                <a
                                    href={null}
                                    on:click={() => {
                                        if (has_changed) {
                                            if (
                                                confirm(
                                                    `${current_problem_seq}번 문제 채점 내용이 변경됐습니다.\n저장하시겠습니까?`,
                                                )
                                            ) {
                                                updateStudentAnswerScore();
                                                current_problem_seq = idx + 1;
                                                getMyClassroomAll();
                                            }
                                            has_changed = false;
                                        } else {
                                            current_problem_seq = idx + 1;
                                            getMyClassroomAll();
                                        }
                                    }}
                                    class="progress-bar-link-true-active"
                                    >{idx + 1}번</a
                                >
                                {#if [1, 2].includes(my_answers_scored_progress_bar[idx])}
                                    <span class="progress-bar-link-scored-not"
                                        >채점미완료</span
                                    >
                                {:else if my_answers_scored_progress_bar[idx] >= 3}
                                    <span class="progress-bar-link-scored"
                                        >채점완료</span
                                    >
                                {/if}
                            {:else}
                                <a
                                    href={null}
                                    on:click={() => {
                                        if (has_changed) {
                                            if (
                                                confirm(
                                                    `${current_problem_seq}번 문제 채점 내용이 변경됐습니다.\n저장하시겠습니까?`,
                                                )
                                            ) {
                                                updateStudentAnswerScore();
                                                current_problem_seq = idx + 1;
                                                getMyClassroomAll();
                                            }
                                            has_changed = false;
                                        } else {
                                            current_problem_seq = idx + 1;
                                            getMyClassroomAll();
                                        }
                                    }}
                                    class="progress-bar-link-true"
                                    >{idx + 1}번</a
                                >
                                {#if [1, 2].includes(my_answers_scored_progress_bar[idx])}
                                    <span class="progress-bar-link-scored-not"
                                        >채점미완료</span
                                    >
                                {:else if my_answers_scored_progress_bar[idx] >= 3}
                                    <span class="progress-bar-link-scored"
                                        >채점완료</span
                                    >
                                {/if}
                            {/if}
                        </div>
                    </div>
                {:else}
                    <div
                        class="progress"
                        role="progressbar"
                        aria-label="Segment {idx + 1}"
                        aria-valuenow="10"
                        aria-valuemin="0"
                        aria-valuemax="100"
                        style="width: 10%; height:50px;"
                    >
                        <div
                            class="progress-bar"
                            id="progress-bar-{idx}"
                            style="background-color:darkgray;"
                        >
                            {#if idx + 1 == current_problem_seq}
                                <a
                                    href={null}
                                    on:click={() => {
                                        if (has_changed) {
                                            if (
                                                confirm(
                                                    `${current_problem_seq}번 문제 채점 내용이 변경됐습니다.\n저장하시겠습니까?`,
                                                )
                                            ) {
                                                updateStudentAnswerScore();
                                                current_problem_seq = idx + 1;
                                                getMyClassroomAll();
                                            }
                                            has_changed = false;
                                        } else {
                                            current_problem_seq = idx + 1;
                                            getMyClassroomAll();
                                        }
                                    }}
                                    class="progress-bar-link-false-active"
                                    >{idx + 1}번</a
                                >
                                {#if [1, 2].includes(my_answers_scored_progress_bar[idx])}
                                    <span class="progress-bar-link-scored-not"
                                        >채점미완료</span
                                    >
                                {:else if my_answers_scored_progress_bar[idx] >= 3}
                                    <span class="progress-bar-link-scored"
                                        >채점완료</span
                                    >
                                {/if}
                            {:else}
                                <a
                                    href={null}
                                    on:click={() => {
                                        if (has_changed) {
                                            if (
                                                confirm(
                                                    `${current_problem_seq}번 문제 채점 내용이 변경됐습니다.\n저장하시겠습니까?`,
                                                )
                                            ) {
                                                updateStudentAnswerScore();
                                                current_problem_seq = idx + 1;
                                                getMyClassroomAll();
                                            }
                                            has_changed = false;
                                        } else {
                                            current_problem_seq = idx + 1;
                                            getMyClassroomAll();
                                        }
                                    }}
                                    class="progress-bar-link-false"
                                    >{idx + 1}번</a
                                >
                                {#if [1, 2].includes(my_answers_scored_progress_bar[idx])}
                                    <span class="progress-bar-link-scored-not"
                                        >채점미완료</span
                                    >
                                {:else if my_answers_scored_progress_bar[idx] >= 3}
                                    <span class="progress-bar-link-scored"
                                        >채점완료</span
                                    >
                                {/if}
                            {/if}
                        </div>
                    </div>
                {/if}
            {/each}
        </div>
        <div
            class="d-flex justify-content-between mt-3"
            style="position:sticky; top:51px; z-index:9999;"
        >
            <div>
                <button
                    class="btn btn-success me-5"
                    style="display:inline-block;"
                    on:click={() => {
                        is_save = true;
                        updateStudentAnswerScore();
                        // getMyClassroomAll();
                    }}>{current_problem_seq}번 문제 채점 저장하기</button
                >
            </div>
            <div>
                <button
                    class="btn btn-success"
                    style="display:inline-block;"
                    on:click={() => {
                        if (has_changed) {
                            if (
                                confirm(
                                    `${current_problem_seq}번 문제 채점 내용이 변경됐습니다.\n저장하시겠습니까?`,
                                )
                            ) {
                                updateStudentAnswerScore();
                                current_problem_seq = 1;
                                getMyClassroomAll();
                            }
                            has_changed = false;
                        } else {
                            current_problem_seq = 1;
                            getMyClassroomAll();
                        }
                    }}>처음으로</button
                >
                <button
                    class="btn btn-success"
                    style="display:inline-block;"
                    on:click={() => {
                        if (current_problem_seq > 1) {
                            if (has_changed) {
                                if (
                                    confirm(
                                        `${current_problem_seq}번 문제 채점 내용이 변경됐습니다.\n저장하시겠습니까?`,
                                    )
                                ) {
                                    updateStudentAnswerScore();
                                    current_problem_seq--;
                                    getMyClassroomAll();
                                }
                                has_changed = false;
                            } else {
                                current_problem_seq--;
                                getMyClassroomAll();
                            }
                        } else {
                            alert("첫번째 문제입니다.");
                        }
                    }}>◀ 이전</button
                >
                <button
                    class="btn btn-success"
                    style="display:inline-block;"
                    on:click={() => {
                        if (current_problem_seq < num_of_problems) {
                            if (has_changed) {
                                if (
                                    confirm(
                                        `${current_problem_seq}번 문제 채점 내용이 변경됐습니다.\n저장하시겠습니까?`,
                                    )
                                ) {
                                    updateStudentAnswerScore();
                                    current_problem_seq++;
                                    getMyClassroomAll();
                                }
                                has_changed = false;
                            } else {
                                current_problem_seq++;
                                getMyClassroomAll();
                            }
                        } else {
                            alert("마지막 문제입니다.");
                        }
                    }}>다음 ▶</button
                >
                <button
                    class="btn btn-success"
                    style="display:inline-block;"
                    on:click={() => {
                        if (has_changed) {
                            if (
                                confirm(
                                    `${current_problem_seq}번 문제 채점 내용이 변경됐습니다.\n저장하시겠습니까?`,
                                )
                            ) {
                                updateStudentAnswerScore();
                                current_problem_seq = num_of_problems;
                                getMyClassroomAll();
                            }
                            has_changed = false;
                        } else {
                            current_problem_seq = num_of_problems;
                            getMyClassroomAll();
                        }
                    }}>마지막으로</button
                >
            </div>
            <div>
                <button
                    class="btn btn-primary"
                    style="display:inline-block;"
                    on:click={() => {
                        if (true) {
                            if (confirm("채점을 완료하시겠습니까?")) {
                                is_save = true;
                                updateStudentAnswerScore();
                                submitMyClassroom();
                            }
                        }
                    }}>채점 완료하기</button
                >
            </div>
        </div>
        <div id="problem_title">
            <h5 class="mt-3 border-bottom pb-2">
                {student.username}({student.userid}) 학생의 클래스룸 채점: 문제
                <span style="font-weight:bold;"
                    >{current_problem_seq}/{num_of_problems}</span
                >
            </h5>
        </div>
        <div id="score_answer">
            {#if problem.problem_level == 1}
                <h6 class="fw-bold">직접 채점하기</h6>
                <div class="d-flex justify-content-between">
                    <div
                        class="d-flex justify-content-between align-self-center form-switch"
                        style="padding-left:0px ;width:110px;"
                    >
                        <span class="fw-bold">오답</span>
                        <input
                            type="checkbox"
                            role="switch"
                            class="form-check-input"
                            bind:checked={level_1_is_correct_teacher}
                            on:change={() => {
                                has_changed = true;
                            }}
                            style="margin-left:0px;"
                        />
                        <span class="fw-bold">정답</span>
                    </div>
                    <div class="d-flex" style="width:85%">
                        <div class="input-group mx-2 my-2" style="width:50%">
                            <span class="input-group-text"
                                >학생에게<br />코멘트</span
                            >
                            <textarea
                                name=""
                                id=""
                                class="form-control"
                                placeholder="학생에게 코멘트 할 내용을 입력해주세요."
                                rows="3"
                                bind:value={comment_to_student[0]}
                                on:change={() => {
                                    has_changed = true;
                                }}
                            ></textarea>
                        </div>
                        <div class="input-group mx-2 my-2" style="width:50%">
                            <span class="input-group-text">교사<br />메모</span>
                            <textarea
                                name=""
                                id=""
                                class="form-control"
                                placeholder="채점자가 스스로 메모할 내용을 입력해주세요."
                                rows="3"
                                bind:value={memo_from_teacher[0]}
                                on:change={() => {
                                    has_changed = true;
                                }}
                            ></textarea>
                        </div>
                    </div>
                </div>
                {#if level_1_is_correct == true}
                    <div class="alert alert-success mt-3">정답입니다.</div>
                {:else if level_1_is_correct == false}
                    <div class="alert alert-danger mt-3">
                        오답입니다.<br /><b>정답: {level_1_real_answer}번</b>
                    </div>
                {/if}
            {/if}
        </div>
        <div id="problem_detail">
            <h6 class="pt-1 pb-2" style="font-weight:bold; font-size:20px;">
                [배점: {problem_scores[current_problem_seq - 1]}점]
                {problem_question}
            </h6>
            {#if problem_content}
                <div class="my-3">
                    {@html marked.parse(problem_content)}
                </div>
            {/if}
            {#if problem.problem_level == 1}
                <div class="my-3 pb-3">
                    <ul class="list-group">
                        <li class="list-group-item">
                            <span>①</span>
                            <div
                                class="form-check align-top"
                                style="display:inline-block;"
                            >
                                <input
                                    class="form-check-input"
                                    type="radio"
                                    name="sel_list"
                                    bind:group={my_answer}
                                    on:change={() => {}}
                                    value={1}
                                    disabled
                                />
                                <label
                                    for=""
                                    class="form-check-label"
                                    id="sel-1">{selections[0]}</label
                                >
                            </div>
                        </li>
                        <li class="list-group-item">
                            <span>②</span>
                            <div
                                class="form-check align-top"
                                style="display:inline-block;"
                            >
                                <input
                                    class="form-check-input"
                                    type="radio"
                                    name="sel_list"
                                    bind:group={my_answer}
                                    on:change={() => {}}
                                    value={2}
                                    disabled
                                />
                                <label
                                    for=""
                                    class="form-check-label"
                                    id="sel-2">{selections[1]}</label
                                >
                            </div>
                        </li>
                        <li class="list-group-item">
                            <span>③</span>
                            <div
                                class="form-check align-top"
                                style="display:inline-block;"
                            >
                                <input
                                    class="form-check-input"
                                    type="radio"
                                    name="sel_list"
                                    bind:group={my_answer}
                                    on:change={() => {}}
                                    value={3}
                                    disabled
                                />
                                <label
                                    for=""
                                    class="form-check-label"
                                    id="sel-3">{selections[2]}</label
                                >
                            </div>
                        </li>
                        <li class="list-group-item">
                            <span>④</span>
                            <div
                                class="form-check align-top"
                                style="display:inline-block;"
                            >
                                <input
                                    class="form-check-input"
                                    type="radio"
                                    name="sel_list"
                                    bind:group={my_answer}
                                    on:change={() => {}}
                                    value={4}
                                    disabled
                                />
                                <label
                                    for=""
                                    class="form-check-label"
                                    id="sel-4">{selections[3]}</label
                                >
                            </div>
                        </li>
                    </ul>
                </div>
            {:else if problem.problem_level == 2}
                <h6 class="pt-2">파이썬 코드</h6>
                <div style="white-space:pre-wrap;">
                    {@html marked.parse(level_2_initcodes_replace)}
                </div>

                <h6 class="pt-4">실행 결과</h6>
                {@html marked.parse(problem.problem_result)}

                <h6 class="pt-4">주관식 문제 답안</h6>
                {#each Array(problem.level_2_num_of_answers) as _, idx}
                    <div class="mb-3">
                        <label for="" class="form-label fw-bold">
                            {#if `${current_problem_seq}` in level_2_problems_sub_scores}
                                [배점: {level_2_problems_sub_scores[
                                    current_problem_seq
                                ][idx]}점] 문제 {idx + 1}번
                            {/if}
                        </label>
                        <h6 class="fw-bold">직접 채점하기</h6>
                        <div class="d-flex justify-content-between">
                            <div
                                class="d-flex justify-content-between align-self-center form-switch"
                                style="padding-left:0px ;width:110px;"
                            >
                                <span class="fw-bold">오답</span>
                                <input
                                    type="checkbox"
                                    role="switch"
                                    class="form-check-input"
                                    bind:checked={level_2_is_correct_teacher[
                                        idx
                                    ]}
                                    on:change={() => {
                                        has_changed = true;
                                    }}
                                    style="margin-left:0px;"
                                />
                                <span class="fw-bold">정답</span>
                            </div>
                            <div class="d-flex" style="width:85%">
                                <div
                                    class="input-group mx-2 my-2"
                                    style="width:50%"
                                >
                                    <span class="input-group-text"
                                        >학생에게<br />코멘트</span
                                    >
                                    <textarea
                                        name=""
                                        id=""
                                        class="form-control"
                                        placeholder="학생에게 코멘트 할 내용을 입력해주세요."
                                        rows="3"
                                        bind:value={comment_to_student[idx]}
                                        on:change={() => {
                                            has_changed = true;
                                        }}
                                    ></textarea>
                                </div>
                                <div
                                    class="input-group mx-2 my-2"
                                    style="width:50%"
                                >
                                    <span class="input-group-text"
                                        >교사<br />메모</span
                                    >
                                    <textarea
                                        name=""
                                        id=""
                                        class="form-control"
                                        placeholder="채점자가 스스로 메모할 내용을 입력해주세요."
                                        rows="3"
                                        bind:value={memo_from_teacher[idx]}
                                        on:change={() => {
                                            has_changed = true;
                                        }}
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                        {#if level_2_is_correct[idx]}
                            <div class="alert alert-success mt-3">
                                정답입니다.
                            </div>
                        {:else}
                            <div class="alert alert-danger mt-3">
                                오답입니다.<br />
                                <b>답안 예시</b><br />
                                <ul>
                                    {#if idx + 1 == 1}
                                        {#each level_2_real_answer_1 as answer}
                                            <li>{answer}</li>
                                        {/each}
                                    {:else if idx + 1 == 2}
                                        {#each level_2_real_answer_2 as answer}
                                            <li>{answer}</li>
                                        {/each}
                                    {:else if idx + 1 == 3}
                                        {#each level_2_real_answer_3 as answer}
                                            <li>{answer}</li>
                                        {/each}
                                    {:else if idx + 1 == 4}
                                        {#each level_2_real_answer_4 as answer}
                                            <li>{answer}</li>
                                        {/each}
                                    {:else if idx + 1 == 5}
                                        {#each level_2_real_answer_5 as answer}
                                            <li>{answer}</li>
                                        {/each}
                                    {/if}
                                </ul>
                            </div>
                        {/if}
                        <input
                            type="text"
                            class="form-control"
                            bind:value={my_answers[idx]}
                            disabled
                        />
                    </div>
                {/each}
            {:else if problem.problem_level == 3}
                <h6 class="">실행 결과</h6>
                {@html marked.parse(problem.problem_result)}

                <h6 class="fw-bold">직접 채점하기</h6>
                <div class="d-flex justify-content-between">
                    <div
                        class="d-flex justify-content-between align-self-center form-switch"
                        style="padding-left:0px ;width:110px;"
                    >
                        <span class="fw-bold">오답</span>
                        <input
                            type="checkbox"
                            role="switch"
                            class="form-check-input"
                            bind:checked={level_3_is_correct_teacher}
                            on:change={() => {
                                has_changed = true;
                                if (level_3_is_correct_teacher) {
                                    document.getElementById(
                                        "particial_score_3",
                                    ).disabled = true;
                                } else {
                                    document.getElementById(
                                        "particial_score_3",
                                    ).disabled = false;
                                }
                            }}
                            style="margin-left:0px;"
                        />
                        <span class="fw-bold">정답</span>
                    </div>
                    <div class="d-flex" style="width:85%">
                        <div class="input-group mx-2 my-2" style="width:50%">
                            <span class="input-group-text"
                                >학생에게<br />코멘트</span
                            >
                            <textarea
                                name=""
                                id=""
                                class="form-control"
                                placeholder="학생에게 코멘트 할 내용을 입력해주세요."
                                rows="3"
                                bind:value={comment_to_student[0]}
                                on:change={() => {
                                    has_changed = true;
                                }}
                            ></textarea>
                        </div>
                        <div class="input-group mx-2 my-2" style="width:50%">
                            <span class="input-group-text">교사<br />메모</span>
                            <textarea
                                name=""
                                id=""
                                class="form-control"
                                placeholder="채점자가 스스로 메모할 내용을 입력해주세요."
                                rows="3"
                                bind:value={memo_from_teacher[0]}
                                on:change={() => {
                                    has_changed = true;
                                }}
                            ></textarea>
                        </div>
                    </div>
                </div>
                <div class="form-floating">
                    <input
                        type="text"
                        class="form-control"
                        id="particial_score_3"
                        bind:value={level_3_particial_score}
                        on:change={() => {
                            has_changed = true;
                        }}
                    />
                    <label for="">
                        <span style="">부분점수</span>
                        <span style="color:red;">
                            ※배점({problem_scores[
                                current_problem_seq - 1
                            ]}점)보다 낮은 부분점수를 입력해주세요.</span
                        >
                    </label>
                </div>
                {#if level_3_is_correct == true}
                    <div class="alert alert-success mt-3">정답입니다.</div>
                {:else if level_3_is_correct == false}
                    <div
                        class="alert alert-danger mt-3"
                        style="white-space:pre-wrap;"
                    >
                        오답입니다.<br /><b>답안예시</b><br />
                        {#each level_3_real_answer as answer, idx}
                            ◎ 예시 ({idx + 1})<br />
                            {answer}
                        {/each}
                    </div>
                {/if}
                <h6 class="pt-3">파이썬 코드</h6>
                <div class="mb-3">
                    <textarea
                        name=""
                        id="python-editor"
                        class="form-control"
                        rows="10"
                        bind:value={my_answers[0]}
                        on:keydown={convertEditor}
                        disabled
                    ></textarea>
                </div>
                <button
                    class="btn btn-primary"
                    id="run-button"
                    disabled
                    on:click={runPython}>실행하기</button
                >
                <h6 class="pt-4">파이썬 코드 실행결과</h6>
                <div id="py-container"></div>
                <div id="out" class="pb-4" style="white-space:pre-wrap;">
                    {my_answers[1]}
                </div>
            {/if}
        </div>
    {:catch error}
        <div class="alert alert-danger">{error.message}</div>
    {/await}
</div>

<style>
    .progress-bar-link-true-active,
    .progress-bar-link-true:hover {
        color: white;
        font-weight: bold;
        text-decoration: none;
        cursor: pointer;
    }
    .progress-bar-link-true {
        color: darkblue;
        text-decoration: none;
        cursor: pointer;
    }
    .progress-bar-link-false-active,
    .progress-bar-link-false:hover {
        color: white;
        font-weight: bold;
        text-decoration: none;
        cursor: pointer;
    }
    .progress-bar-link-false {
        color: gray;
        text-decoration: none;
        cursor: pointer;
    }
    .progress-bar-link-scored {
        color: lightgreen;
        text-decoration: none;
        cursor: pointer;
    }
    .progress-bar-link-scored-not {
        color: lightpink;
        text-decoration: none;
        cursor: pointer;
    }
</style>

<script>
    import { get } from "svelte/store";
    import { afterUpdate, tick } from "svelte";
    import { link, push } from "svelte-spa-router";
    import { marked } from "marked";
    import fastapi from "../lib/api";
    import Error from "../components/Error.svelte";
    import { userid } from "../lib/store";
    // import { lang } from "moment";

    let error = { detail: [] };
    let error_message = "";
    let success_message = "";
    let is_save = false;

    let current_classroom = 0;

    let classroom = {};
    let myclassroom = {};
    let myclassroom_idx = 0;
    let answers = {};
    let problems = {};
    let problem = {};
    let problem_scores = [];
    let selections = ["", "", "", ""];
    let problem_question = "",
        problem_content = "",
        level_2_initcodes_replace = "";
    let level_2_problems_sub_scores = {};
    let answer = {};
    let my_answer = 0;
    let my_answers = ["", "", "", "", ""];
    let my_answers_progress_bar = [];
    let num_of_problems = 0;
    let current_problem_seq = 0;
    let current_problem_idx = 0;
    let time_now = null;
    let time_goal_at = null;
    let time_goal = null;
    let total_percent = 0.0;
    let total_percent_label = "";
    let total_percent_bg = "";
    let label_goal = "";
    let time_progress_bar_label = "";
    let chatgpt_message = "";
    let chatgpt = [];
    let chatgpt_dialog = [];
    let chatgpt_conversation_html = "";
    let is_available = false;
    let save_message = "";

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
            }
        }
        // console.log( `my_answers_progress_bar=\n${JSON.stringify(my_answers_progress_bar)}`,);
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
            emptyMyAnswer();
            setMyAnswer();
        }
    }

    function setMyAnswer() {
        if (current_problem_seq != 0) {
            answer = answers[current_problem_seq];
            // console.log(`answer=\n${JSON.stringify(answer)}`);
            if (answer.answer.length > 0) {
                if (problem.problem_level == 1) {
                    my_answer = Number(answer.answer[0]);
                } else if (problem.problem_level == 2) {
                    for (let i = 0; i < answer.answer.length; i++) {
                        my_answers[i] = answer.answer[i];
                    }
                } else if (problem.problem_level == 3) {
                    my_answers[0] = answer.answer[0];
                    my_answers[1] = answer.answer[1];
                }
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

    function emptyMyAnswer() {
        my_answer = 0;
        my_answers = ["", "", "", "", ""];
    }

    function updateMyAnswer() {
        let has_answers = false;
        for (let i = 0; i < my_answers.length; i++) {
            if (my_answers[i] != "") {
                has_answers = true;
                break;
            }
        }
        if (has_answers || is_save) {
            if (problem.problem_level == 1) {
                my_answers[0] = my_answer.toString();
            } else if (problem.problem_level == 3) {
                // console.log(`코드=${my_answers[0]}\n실행결과=${my_answers[1]}`);
                if (my_answers[0] == "") {
                    alert(
                        `'파이썬 코드'가 없습니다.\n'파이썬 코드'를 입력해주세요.`,
                    );
                    return false;
                }
            }
            for (let i = 0; i < my_answers.length; i++) {
                my_answers[i] = my_answers[i].trim();
            }
            answer["answer"] = my_answers;
            answers[current_problem_seq].answer = my_answers;
            // console.log( `${JSON.stringify(answers[current_problem_seq].answer)}`,);
            setProgressBar();
            fastapi(
                "put",
                `/edu/student/update/answer/${answer.idx}`,
                answer,
                (json) => {},
                (json_error) => {},
            );
        }
        is_save = false;
    }

    function updateCurrentProblem() {
        let update_params = {
            current_problem_seq: current_problem_seq,
        };
        fastapi(
            "put",
            `/edu/student/update/current_problem/${myclassroom.idx}`,
            update_params,
            (json) => {},
            (json_error) => {},
        );
    }

    function submitMyClassroomAll() {
        let answers_idx_list = [];
        for (const [k, v] of Object.entries(answers)) {
            // console.log(`answer.idx = ${v.idx}`);
            answers_idx_list.push(v.idx);
        }
        // console.log(`answers_idx_list = ${answers_idx_list}`);
        // return false;
        let update_params = {
            userid: $userid,
            classroom_idx: current_classroom,
            classroom_status: 1,
            answers_idx_list: answers_idx_list,
        };
        fastapi(
            "put",
            `/edu/student/update/my-classroom/status/${myclassroom.idx}`,
            update_params,
            (json) => {},
            (json_error) => {},
        );
    }

    const scrollToBottom = (node) => {
        const scroll = () =>
            node.scroll({
                top: node.scrollHeight,
                behavior: "smooth",
            });
        scroll();

        return { update: scroll };
    };

    function setAiChatgptDialogSpinnerOn() {
        let spinner = document.getElementById("ai-chatgpt-spinner");
        spinner.style.display = "inline-block";
    }

    function setAiChatgptDialogSpinnerOff() {
        let spinner = document.getElementById("ai-chatgpt-spinner");
        spinner.style.display = "none";
    }

    function appendToAiChatgptDialog(dialog) {
        chatgpt_conversation_html += dialog;
    }

    function getAiChatgptDialog(type, dialog) {
        let html_value = "";
        if (type == "user") {
            let dialog_value = marked.parse(dialog);
            html_value = `<div style="margin:0; padding:0"><img style="width:auto;height:30px;" src="https://github.com/user-attachments/assets/ed901fb9-18ce-4a0d-a2fd-b7f333458899"></div>`;
            html_value += `<div style="margin:0; padding:0">${dialog_value}</div>`;
        } else if (type == "assistant") {
            let dialog_value = marked.parse(dialog);
            html_value = `<div style="margin:0; padding:0"><img style="width:auto;height:30px;" src="https://github.com/user-attachments/assets/f8608ea1-c44d-4d29-8518-7e4549373f4d"></div>`;
            html_value += `<div style="margin:0; padding:0">${dialog_value}</div>`;
        }
        return html_value;
    }

    function setAiChatgptDialog() {
        if (chatgpt_dialog.length > 0) {
            for (let i = 0; i < chatgpt_dialog.length; i++) {
                appendToAiChatgptDialog(
                    getAiChatgptDialog(
                        chatgpt_dialog[i]["role"],
                        chatgpt_dialog[i]["content"],
                    ),
                );
            }
        }
    }

    function ai_send_message(event) {
        event.preventDefault();
        if (myclassroom_idx == 0) {
            return false;
        }
        if (chatgpt_message.trim() != "") {
            appendToAiChatgptDialog(
                getAiChatgptDialog("user", chatgpt_message),
            );

            let update_params = {
                idx: myclassroom_idx,
                dialog: chatgpt_message,
            };
            chatgpt_message = "";
            let chatgpt_msg_tag = document.getElementById("chatgpt_message");
            chatgpt_msg_tag.focus();
            setAiChatgptDialogSpinnerOn();
            fastapi(
                "put",
                `/edu/student/ai_helper`,
                update_params,
                (json) => {
                    // console.log(`post return=${json.ai_message}`);
                    appendToAiChatgptDialog(
                        getAiChatgptDialog("assistant", json.ai_message),
                    );
                    setAiChatgptDialogSpinnerOff();
                },
                (json_error) => {
                    setAiChatgptDialogSpinnerOff();
                },
            );
        }
    }
    function ai_code_feedback(event) {
        event.preventDefault();
        if (myclassroom_idx == 0) {
            return false;
        }
        if (problem.problem_level != 3) {
            alert("실습형 문제에서 코드 피드백을 할 수 있습니다.");
            return false;
        }
        if (my_answers[0].trim() != "") {
            appendToAiChatgptDialog(
                getAiChatgptDialog("user", my_answers[0].trim()),
            );

            let update_params = {
                idx: myclassroom_idx,
                dialog: my_answers[0].trim(),
            };
            setAiChatgptDialogSpinnerOn();
            fastapi(
                "put",
                `/edu/student/ai_helper`,
                update_params,
                (json) => {
                    // console.log(`post return=${json.ai_message}`);
                    appendToAiChatgptDialog(
                        getAiChatgptDialog("assistant", json.ai_message),
                    );
                    setAiChatgptDialogSpinnerOff();
                },
                (json_error) => {
                    setAiChatgptDialogSpinnerOff();
                },
            );
        }
    }

    function runTimer() {
        let timerId = setInterval(() => {
            let c_now = new Date();
            time_now = new Date(
                c_now.getFullYear(),
                c_now.getMonth(),
                c_now.getDate(),
                c_now.getHours(),
                c_now.getMinutes(),
                c_now.getSeconds(),
            );
            if (time_goal.getTime() - time_now.getTime() <= 0) {
                error_message = `학습시간이 다됐습니다. 학습을 더 진행하려면 "학습설정 ＞ 목표 학습시간 연장" 메뉴에서 목표 학습시간을 연장해주세요.`;
                is_available = false;
            } else {
                error_message = "";
                is_available = true;
            }
            // console.log(`${time_now}\n${time_goal}\n${time_goal_at}}`);
            // console.log(`${time_now.getTime()}`)
            // console.log(`${time_goal.getTime()}`)
            // console.log(`${time_goal_at.getTime()}`)
            let total = time_goal.getTime() - time_goal_at.getTime();
            let done = time_now.getTime() - time_goal_at.getTime();
            let hour_value =
                time_goal.getHours() > 12
                    ? `오후 ${time_goal.getHours() - 12}`
                    : `오전 ${time_goal.getHours()}`;
            label_goal = `${hour_value}시 ${time_goal.getMinutes()}분`;
            total_percent = (done / total) * 100;
            let remain_min = Math.floor(
                (time_goal.getTime() - time_now.getTime()) / 1000 / 60,
            );
            let remain_sec = Math.floor(
                ((time_goal.getTime() - time_now.getTime()) / 1000) % 60,
            );
            total_percent_label = `${total_percent.toFixed(2)}`;
            if (remain_min <= 15.0) {
                total_percent_bg = "bg-danger";
                time_progress_bar_label = `${label_goal} 까지 ${total_percent_label}% 진행중 ( ${remain_min.toFixed(0)}분 ${remain_sec}초 남았습니다 )`;
            } else {
                total_percent_bg = "bg-info";
                time_progress_bar_label = `${label_goal} 까지 ${total_percent_label}% 진행중`;
            }
            // console.log(`${total_percent}\n${done} / ${total}`)
        }, 1000);
    }

    async function getMyClassroomAll() {
        fastapi(
            "get",
            `/edu/user/${$userid}`,
            {},
            (json0) => {
                current_classroom = json0.current_classroom;
                fastapi(
                    "get",
                    `/edu/student/answer/list/${$userid}/${current_classroom}`,
                    {},
                    (json) => {
                        classroom = json.classroom;
                        myclassroom = json.my_classroom;
                        myclassroom_idx = myclassroom.idx;
                        chatgpt = myclassroom.chatgpt;
                        // console.log(`chatgpt=${chatgpt.length}`)
                        // console.log(`${JSON.stringify(chatgpt[2])}`)
                        if (chatgpt.length > 2) {
                            for (let i = 2; i < chatgpt.length; i++) {
                                chatgpt_dialog.push(chatgpt[i]);
                            }
                        }
                        // console.log(JSON.stringify(chatgpt_dialog))
                        if (myclassroom.classroom_status > 0) {
                            error_message =
                                "답안을 제출했습니다.<br>'학습결과'에서 제출한 문제에 대한 결과를 확인해주세요.";
                            return false;
                        }
                        if (
                            myclassroom.time_goal_at == null ||
                            myclassroom.time_goal == null
                        ) {
                            error_message = `학습시간 목표를 선택하지 않았습니다. "학습설정 ＞ 학습시간 목표설정" 메뉴에서 목표 학습시간을 선택해주세요.`;
                            is_available = false;
                            return false;
                        }
                        time_now = new Date();
                        time_goal = new Date(myclassroom.time_goal);
                        time_goal_at = new Date(myclassroom.time_goal_at);
                        if (time_goal.getTime() - time_now.getTime() <= 0) {
                            is_available = false;
                            error_message = `목표 학습시간의 기한이 지났습니다. "학습설정 ＞ 목표 학습시간 연장" 메뉴에서 목표 학습시간을 연장해주세요.`;
                            return false;
                        } else {
                            error_message = "";
                            is_available = true;
                        }
                        let total =
                            time_goal.getTime() - time_goal_at.getTime();
                        let done = time_now.getTime() - time_goal_at.getTime();
                        let hour_value =
                            time_goal.getHours() > 12
                                ? `오후 ${time_goal.getHours() - 12}`
                                : `오전 ${time_goal.getHours()}`;
                        label_goal = `${hour_value}시 ${time_goal.getMinutes()}분`;
                        total_percent = (done / total) * 100;
                        let remain_min = Math.floor(
                            (time_goal.getTime() - time_now.getTime()) /
                                1000 /
                                60,
                        );
                        let remain_sec = Math.floor(
                            ((time_goal.getTime() - time_now.getTime()) /
                                1000) %
                                60,
                        );
                        total_percent_label = `${total_percent.toFixed(2)}`;
                        if (remain_min <= 15.0) {
                            total_percent_bg = "bg-danger";
                            time_progress_bar_label = `${label_goal} 까지 ${total_percent_label}% 진행중 ( ${remain_min.toFixed(0)}분 ${remain_sec}초 남았습니다 )`;
                        } else {
                            total_percent_bg = "bg-info";
                            time_progress_bar_label = `${label_goal} 까지 ${total_percent_label}% 진행중`;
                        }
                        // console.log(`${total_percent}\n${done} / ${total}`)
                        // answer_list = json.my_answer_list;
                        // problem_list = json.problem_list;
                        if (json.my_answer_list.length == 0) {
                            alert("answers 데이터가 없습니다.");
                        } else {
                            for (
                                let i = 0;
                                i < json.my_answer_list.length;
                                i++
                            ) {
                                let obj = json.my_answer_list[i];
                                answers[`${i + 1}`] = obj;
                            }
                        }
                        for (let i = 0; i < json.problem_list.length; i++) {
                            let obj = json.problem_list[i];
                            problems[`${i + 1}`] = obj;
                        }
                        num_of_problems = json.num_of_problems;
                        setProgressBar();
                        current_problem_seq =
                            json.current_problem_seq == 0
                                ? 1
                                : json.current_problem_seq;
                        current_problem_idx = json.current_problem_idx;
                        setProblem();
                        setProblemScores();
                        runTimer();
                        setAiChatgptDialog();
                        // console.log(`num_of_problems=${num_of_problems}`);
                        // console.log("classroom=\n" + JSON.stringify(classroom));
                        // console.log("myclassroom=\n" + JSON.stringify(myclassroom));
                        // console.log( "my_answer_list=\n" + JSON.stringify(json.my_answer_list),);
                        // console.log( "problem_list=\n" + JSON.stringify(json.problem_list),);
                        // console.log("answers=\n" + JSON.stringify(answers));
                        // console.log("problems=\n" + JSON.stringify(problems));
                        // console.log(`current_problem_seq=${current_problem_seq}`);
                        // console.log(`current_problem_idx=${current_problem_idx}`);
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
                                    i <
                                    problem.level_2_scores_precent.length - 1;
                                    i++
                                ) {
                                    let per = problem.level_2_scores_precent[i];
                                    tmp[i] = Math.floor(
                                        problem_score * per * 0.01,
                                    );
                                    total += tmp[i];
                                }
                                tmp[problem.level_2_scores_precent.length - 1] =
                                    problem_score - total;
                                level_2_problems_sub_scores[seq] = tmp;
                            }
                        }
                        // console.log(`level_2_problems_sub_scores=\n${JSON.stringify(level_2_problems_sub_scores)}`)
                    },
                    {},
                );
            },
            (json_error) => {},
        );
    }
</script>

<svelte:head>
    {#if myclassroom.classroom_status == 0 && is_available == true}
        <link
            rel="stylesheet"
            href="https://pyscript.net/latest/pyscript.css"
        />
        <script defer src="https://pyscript.net/latest/pyscript.js"></script>
    {/if}
</svelte:head>

{#if myclassroom.classroom_status == 0 && is_available == true}
    <py-terminal style="display:none;"></py-terminal>
{/if}

<div class="container">
    <Error {error} />
    {#if error_message}
        <div class="alert alert-danger mt-3">{@html error_message}</div>
    {/if}
    {#if success_message}
        <div class="alert alert-success mt-3">{@html success_message}</div>
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
        {#if myclassroom.classroom_status == 0 && is_available == true}
            <div
                class="offcanvas offcanvas-start"
                data-bs-backdrop="static"
                tabindex="-1"
                id="staticBackdrop"
                aria-labelledby="staticBackdropLabel"
                style="z-index:10001"
            >
                <div class="offcanvas-header">
                    <h5 class="offcanvas-title" id="staticBackdropLabel">
                        학습 로드맵
                    </h5>
                    <button
                        type="button"
                        class="btn-close"
                        data-bs-dismiss="offcanvas"
                        aria-label="Close"
                    ></button>
                </div>
                <div class="offcanvas-body">
                    <ul class="list-group my-3">
                        {#if myclassroom.classroom_idx == 1}
                            <li
                                class="list-group-item active"
                                aria-current="true"
                            >
                                1. 변수와 자료형의 이해와 활용
                            </li>
                        {:else}
                            <li class="list-group-item">
                                1. 변수와 자료형의 이해와 활용
                            </li>
                        {/if}
                        {#if myclassroom.classroom_idx == 2}
                            <li
                                class="list-group-item active"
                                aria-current="true"
                            >
                                2. 연산자의 이해와 활용
                            </li>
                        {:else}
                            <li class="list-group-item">
                                2. 연산자의 이해와 활용
                            </li>
                        {/if}
                        {#if myclassroom.classroom_idx == 3}
                            <li
                                class="list-group-item active"
                                aria-current="true"
                            >
                                3. 선택 제어문의 이해와 활용
                            </li>
                        {:else}
                            <li class="list-group-item">
                                3. 선택 제어문의 이해와 활용
                            </li>
                        {/if}
                        {#if myclassroom.classroom_idx == 4}
                            <li
                                class="list-group-item active"
                                aria-current="true"
                            >
                                4. 반복 제어문의 이해와 활용
                                <div>
                                    <ul>
                                        <li>
                                            <span>반복 제어문 지식</span>
                                            <div
                                                class="progress"
                                                role="progressbar"
                                                aria-label="Info example"
                                                aria-valuenow="50"
                                                aria-valuemin="0"
                                                aria-valuemax="100"
                                            >
                                                <div
                                                    class="progress-bar bg-info text-dark"
                                                    style="width: 50%"
                                                >
                                                    50%
                                                </div>
                                            </div>
                                        </li>
                                        <li>
                                            <span>반복 제어문 사용규칙</span>
                                            <div
                                                class="progress"
                                                role="progressbar"
                                                aria-label="Info example"
                                                aria-valuenow="50"
                                                aria-valuemin="0"
                                                aria-valuemax="100"
                                            >
                                                <div
                                                    class="progress-bar bg-info text-dark"
                                                    style="width: 50%"
                                                >
                                                    50%
                                                </div>
                                            </div>
                                        </li>
                                        <li>
                                            <span>반복 제어문 기능수행</span>
                                            <div
                                                class="progress"
                                                role="progressbar"
                                                aria-label="Info example"
                                                aria-valuenow="50"
                                                aria-valuemin="0"
                                                aria-valuemax="100"
                                            >
                                                <div
                                                    class="progress-bar bg-info text-dark"
                                                    style="width: 25%"
                                                >
                                                    25%
                                                </div>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                            </li>
                        {:else}
                            <li class="list-group-item">
                                4. 반복 제어문의 이해와 활용
                            </li>
                        {/if}
                        <li class="list-group-item">5. 다차원 데이터 활용</li>
                        <li class="list-group-item">6. 클래스와 인스턴스</li>
                    </ul>
                </div>
            </div>

            <div
                class="offcanvas offcanvas-bottom"
                data-bs-scroll="true"
                data-bs-backdrop="false"
                tabindex="-1"
                id="offcanvasScrolling"
                aria-labelledby="offcanvasScrollingLabel"
            >
                <div class="offcanvas-header">
                    <h5 class="offcanvas-title" id="offcanvasScrollingLabel">
                        인공지능 학습도우미에게 물어보세요
                        <div id="ai-chatgpt-spinner" style="display:none;">
                            <span
                                class="spinner-grow spinner-grow-sm text-info"
                                aria-hidden="true"
                            ></span>
                            <span class="visually-hidden" role="status"
                                >Loading...</span
                            >
                        </div>
                    </h5>
                    <button
                        type="button"
                        class="btn-close"
                        data-bs-dismiss="offcanvas"
                        aria-label="Close"
                    ></button>
                </div>
                <div class="offcanvas-body" style="padding:0px; margin:0;">
                    <div
                        style="display: flex; flex-direction: row; width:100%; height:100%;"
                    >
                        <form method="post">
                            <div
                                style="display: flex; flex-direction: column; padding:0px; margin:0; width:400px; height:100%;"
                            >
                                <div
                                    style="display: flex; flex-direction: row; padding:0px; margin:0;"
                                >
                                    <button
                                        class="btn btn-info text-light mb-1"
                                        style="flex-grow: 1;"
                                        type="submit"
                                        on:click={ai_send_message}
                                        >메시지 보내기</button
                                    >
                                    <button
                                        class="btn btn-success text-light ms-1 mb-1"
                                        style="width:120px;"
                                        on:click={ai_code_feedback}
                                        >코드 피드백</button
                                    >
                                </div>
                                <div class="mb-1">
                                    <textarea
                                        class="form-control"
                                        id="chatgpt_message"
                                        rows="5"
                                        bind:value={chatgpt_message}
                                    ></textarea>
                                </div>
                                <div style="flex-grow:1;">&nbsp;</div>
                            </div>
                        </form>
                        <div
                            style="padding:0 9px 0 9px; margin:0; flex-grow:1; height:100%; overflow-y:auto;"
                            id="chatgpt_conversation"
                            use:scrollToBottom={chatgpt_conversation_html}
                        >
                            {@html chatgpt_conversation_html}
                        </div>
                    </div>
                </div>
            </div>
            <div class="text-end">
                <div
                    class="form-check form-switch"
                    style="display:inline-block;"
                >
                    <input
                        class="form-check-input"
                        type="checkbox"
                        role="switch"
                        id="flexSwitchCheckCheckedDisabled"
                        checked
                        disabled
                    />
                    <label
                        class="form-check-label"
                        for="flexSwitchCheckCheckedDisabled">자동저장</label
                    >
                </div>
            </div>
            <div
                class="progress"
                role="progressbar"
                aria-label=""
                aria-valuenow="25"
                aria-valuemin="0"
                aria-valuemax="100"
                style="position:sticky; top:0px;"
            >
                <div
                    class="progress-bar {total_percent_bg}"
                    style="width: {total_percent}%"
                >
                    {time_progress_bar_label}
                </div>
            </div>
            <div class="progress-stacked" style="position:sticky; top:15px;">
                {#each Array(my_answers_progress_bar.length) as _, idx}
                    {#if my_answers_progress_bar[idx]}
                        <div
                            class="progress"
                            role="progressbar"
                            aria-label="Segment {idx + 1}"
                            aria-valuenow="10"
                            aria-valuemin="0"
                            aria-valuemax="100"
                            style="width: 10%"
                        >
                            <div class="progress-bar" id="progress-bar-{idx}">
                                {#if idx + 1 == current_problem_seq}
                                    <a
                                        href={null}
                                        on:click={() => {
                                            updateMyAnswer();
                                            current_problem_seq = idx + 1;
                                            setProblem();
                                        }}
                                        class="progress-bar-link-true-active"
                                        >{idx + 1}번</a
                                    >
                                {:else}
                                    <a
                                        href={null}
                                        on:click={() => {
                                            updateMyAnswer();
                                            current_problem_seq = idx + 1;
                                            setProblem();
                                        }}
                                        class="progress-bar-link-true"
                                        >{idx + 1}번</a
                                    >
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
                            style="width: 10%"
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
                                            updateMyAnswer();
                                            current_problem_seq = idx + 1;
                                            setProblem();
                                        }}
                                        class="progress-bar-link-false-active"
                                        >{idx + 1}번</a
                                    >
                                {:else}
                                    <a
                                        href={null}
                                        on:click={() => {
                                            updateMyAnswer();
                                            current_problem_seq = idx + 1;
                                            setProblem();
                                        }}
                                        class="progress-bar-link-false"
                                        >{idx + 1}번</a
                                    >
                                {/if}
                            </div>
                        </div>
                    {/if}
                {/each}
            </div>
            <div
                class="d-flex justify-content-between mt-3"
                style="position:sticky; top:35px;"
            >
                <div>
                    <button
                        class="btn btn-info text-light"
                        type="button"
                        data-bs-toggle="offcanvas"
                        data-bs-target="#staticBackdrop"
                        aria-controls="staticBackdrop"
                        style="font-size:12px; padding:9px;"
                        >학습로드맵
                    </button>
                    <button
                        class="btn btn-info text-light"
                        type="button"
                        data-bs-toggle="offcanvas"
                        data-bs-target="#offcanvasScrolling"
                        aria-controls="offcanvasScrolling"
                        style="font-size:12px; padding:9px;">AI 학습도우미</button
                    >
                    <!--
                    <button
                        class="btn btn-success"
                        style="display:inline-block;"
                        on:click={() => {
                            is_save = true;
                            updateCurrentProblem();
                            updateMyAnswer();
                        }}>저장하기</button
                    >
                    -->
                </div>
                <div>
                    <button
                        class="btn btn-success"
                        style="display:inline-block;"
                        on:click={() => {
                            is_save = true;
                            updateCurrentProblem();
                            updateMyAnswer();
                            current_problem_seq = 1;
                            setProblem();
                        }}>처음 문제</button
                    >
                    <button
                        class="btn btn-success"
                        style="display:inline-block;"
                        on:click={() => {
                            is_save = true;
                            updateCurrentProblem();
                            updateMyAnswer();
                            if (current_problem_seq > 1) {
                                current_problem_seq--;
                                setProblem();
                            } else {
                                alert("첫번째 문제입니다.");
                            }
                        }}>◀ 이전 문제</button
                    >
                    <button
                        class="btn btn-success"
                        style="display:inline-block;"
                        on:click={() => {
                            is_save = true;
                            updateCurrentProblem();
                            updateMyAnswer();
                            if (current_problem_seq < num_of_problems) {
                                current_problem_seq++;
                                setProblem();
                            } else {
                                alert("마지막 문제입니다.");
                            }
                        }}>다음 문제 ▶</button
                    >
                    <button
                        class="btn btn-success"
                        style="display:inline-block;"
                        on:click={() => {
                            is_save = true;
                            updateCurrentProblem();
                            updateMyAnswer();
                            current_problem_seq = num_of_problems;
                            setProblem();
                            emptyMyAnswer();
                        }}>마지막 문제</button
                    >
                </div>
                <div>
                    <button
                        class="btn btn-primary"
                        style="display:inline-block;"
                        on:click={() => {
                            if (
                                confirm(
                                    "제출 후 문제의 답안을 수정할 수 없습니다.\n모든 문제의 답안을 제출하시겠습니까?",
                                )
                            ) {
                                is_save = true;
                                updateCurrentProblem();
                                updateMyAnswer();
                                submitMyClassroomAll();
                                success_message = "";
                                error_message = "";
                                alert(
                                    `제출하였습니다.\n'학습결과' 메뉴에서 결과를 확인하세요.'`,
                                );
                                push("/");
                            }
                        }}>결과 제출하기</button
                    >
                </div>
            </div>
            <div id="problem_title">
                <h5 class="mt-3 border-bottom pb-2">
                    나의 클래스룸: 문제 <span style="font-weight:bold;"
                        >{current_problem_seq}/{num_of_problems}</span
                    >
                </h5>
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
                                [배점: {level_2_problems_sub_scores[
                                    current_problem_seq
                                ][idx]}점] 문제 {idx + 1}번</label
                            >
                            <input
                                type="text"
                                class="form-control"
                                bind:value={my_answers[idx]}
                            />
                        </div>
                    {/each}
                {:else if problem.problem_level == 3}
                    <h6 class="">실행 결과</h6>
                    {@html marked.parse(problem.problem_result)}

                    <h6 class="pt-3">파이썬 코드</h6>
                    <div class="mb-3">
                        <textarea
                            name=""
                            id="python-editor"
                            class="form-control"
                            rows="10"
                            bind:value={my_answers[0]}
                            on:keydown={convertEditor}
                        ></textarea>
                    </div>
                    <button
                        class="btn btn-primary"
                        id="run-button"
                        on:click={runPython}>실행하기</button
                    >
                    <h6 class="pt-4">파이썬 코드 실행결과</h6>
                    <div id="py-container"></div>
                    <div id="out" class="pb-4" style="white-space:pre-wrap;">
                        {my_answers[1]}
                    </div>
                {/if}
            </div>
            <div style="height:500px;">&nbsp;</div>
        {:else}
            <br />
        {/if}
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
</style>

<script>
    import { link, push } from "svelte-spa-router";
    import { marked } from "marked";
    import fastapi from "../lib/api";
    import Error from "../components/Error.svelte";
    import { userid, student_current_classroom } from "../lib/store";

    let error = { detail: [] };
    let error_message = "";
    let success_message = "";
    let problem_title = document.getElementById("problem_title");
    let problem_detail = document.getElementById("problem_detail");

    let my_classroom = {};
    let classroom = {};
    let problem = {};
    let problem_question = "", problem_content = "";
    let answer = {};
    let my_answer;
    let my_answers = ["", "", "", "", ""];
    let num_of_problems = 0;
    let my_answer_list = [];
    let my_answer_dict = {};
    let my_answers_progress_bar = [];
    let current_problem_seq = 0;
    let current_problem_idx = 0;

    function run_python() {
        let out = document.getElementById("out");
        out.innerText = "";
        let code = document.getElementById("python-editor").value;
        // alert(code);
        // return false;
        let code_final = `<py-script id="input" output="out" output-mode="replace">${code}</py-script>`;
        document.getElementById("py-container").innerHTML = code_final;
    }

    function convert_editor(e) {
        if (e.keyCode === 9) {
            let editor = document.getElementById("python-editor");
            let start = editor.selectionStart;
            let end = editor.selectionEnd;
            let code = document.getElementById("python-editor").value;
            editor.value = `${code.substring(0, start)}    ${code.substring(end)}`;
            editor.selectionStart = editor.selectionEnd = start + 4;
            // alert(`${code.substring(0, start)}`)
            // alert(`${code.substring(end)}`)
            e.preventDefault();
        }
    }

    function update_my_answer() {
        if (problem.problem_level == 1) {
            my_answers[0] = my_answer.toString();
        } else if (problem.problem_level == 3) {
            // let editor_sourcecode = document .querySelector("#sourcecode") .getPySrc();
            // my_answer = editor_sourcecode;
            // alert(`${my_answer}`);
            let output = document.getElementById("out").innerText.trim();
            // let has_check = confirm( `'파이썬 코드'와 '파이썬 코드 실행결과' 를 저장하시겠습니가?`,);
            // if (!has_check) { return false; }
            if (output == "") {
                alert(
                    `'파이썬 코드 실행결과'가 없습니다.\n'파이썬 코드'를 실행 후 저장해주세요.`,
                );
                return false;
            }
            my_answers[0] = my_answer;
            my_answers[1] = output;
        }
        answer["answer"] = my_answers;
        // console.log( `current_problem_seq=${current_problem_seq}, current_problem_idx=${current_problem_idx}`,);
        // console.log(`my_answers=${my_answers}`);
        // console.log(`answer=${JSON.stringify(answer)}`);
        fastapi(
            "put",
            `/edu/student/update/answer/${answer.idx}`,
            answer,
            (json) => {},
            (json_error) => {},
        );
    }

    function update_current_problem() {
        let update_params = {
            current_problem_seq: current_problem_seq,
        };
        fastapi(
            "put",
            `/edu/student/update/current_problem/${my_classroom.idx}`,
            update_params,
            (json) => {},
            (json_error) => {},
        );
    }

    function get_my_answer() {
        fastapi(
            "get",
            `/edu/student/answer/${$userid}/${my_classroom.classroom_idx}/${current_problem_idx}/${current_problem_seq}`,
            {},
            (json) => {
                answer = json;
                // console.log(JSON.stringify(json));
                if (json.answer.length > 0) {
                    if (problem.problem_level == 1) {
                        my_answer = Number(json.answer[0]);
                    } else if (problem.problem_level == 2) {
                        for (let i = 0; i < json.answer.length; i++) {
                            my_answers[i] = json.answer[i];
                        }
                    } else if (problem.problem_level == 3) {
                        let out = document.getElementById("out");
                        my_answer = json.answer[0];
                        out.innerText = json.answer[1];
                    }
                }
                if (answer.selection_list.length > 0) {
                    let sel_idx = 1;
                    for (let i = 0; i < answer.selection_list.length; i++) {
                        let sel_val = answer.selection_list[i];
                        let sel_str = "";
                        switch (sel_val) {
                            case 0:
                                sel_str = problem.level_1_selection_answer;
                                break;
                            case 1:
                                sel_str = problem.level_1_selection_1;
                                break;
                            case 2:
                                sel_str = problem.level_1_selection_2;
                                break;
                            case 3:
                                sel_str = problem.level_1_selection_3;
                                break;
                        }
                        document.getElementById(`sel-${sel_idx++}`).innerText =
                            ` ${sel_str}`;
                    }
                }
            },
            (json_error) => {},
        );
    }

    function get_problem() {
        my_answer = "";
        for (let i = 0; i < 4; i++) {
            my_answers[i] = "";
        }
        let problem_seq = current_problem_seq;
        if (problem_seq <= classroom.level_1_problems.length) {
            current_problem_idx = classroom.level_1_problems[problem_seq - 1];
        } else if (
            problem_seq <=
            classroom.level_1_problems.length +
                classroom.level_2_problems.length
        ) {
            problem_seq =
                current_problem_seq - classroom.level_1_problems.length;
            current_problem_idx = classroom.level_2_problems[problem_seq - 1];
        } else {
            problem_seq =
                current_problem_seq -
                classroom.level_1_problems.length -
                classroom.level_2_problems.length;
            current_problem_idx = classroom.level_3_problems[problem_seq - 1];
        }
        fastapi(
            "get",
            `/edu/develop/problem/${current_problem_idx}`,
            {},
            (json) => {
                problem = json;
                problem_question = problem.problem_question;
                problem_content = problem.problem_content;
                // console.log(JSON.stringify(problem));
                console.log( `current_problem_seq=${current_problem_seq}, current_problem_idx=${current_problem_idx}`,);
                get_my_answer();
            },
            (json_error) => {},
        );
    }

    async function get_my_classroom() {
        if ($student_current_classroom == 0) {
            error_message =
                "학습할 주제를 선택하지 않았습니다. '학습설정' 메뉴에서 학습할 주제를 선택하세요.";
            return false;
        }
        fastapi(
            "get",
            `/edu/student/my-classroom/${$userid}/${$student_current_classroom}`,
            {},
            (json1) => {
                fastapi(
                    "get",
                    `/edu/student/classroom/${json1.classroom_idx}`,
                    {},
                    (json2) => {
                        my_classroom = json1;
                        classroom = json2;
                        num_of_problems =
                            json2.level_1_problems.length +
                            json2.level_2_problems.length +
                            json2.level_3_problems.length;
                        current_problem_seq = json1.current_problem_seq;
                        // console.log( `current_problem_seq=${json1.current_problem_seq}`,);
                        for (let i = 0; i < num_of_problems; i++) {
                            my_answers_progress_bar[i] = false;
                        }
                        // console.log(`my_answers_progress_bar=\n${JSON.stringify(my_answers_progress_bar)}`)
                        // console.log(my_answers_progress_bar.length);
                        error_message = "";
                        get_problem();
                    },
                    (json2_error) => {},
                );
            },
            (json1_error) => {
                error = json1_error;
            },
        );

        /*
        const url1 = `/edu/student/classroom/${json1.classroom_idx}`,
        const url = `/edu/student/answer/list/${$userid}/${$student_current_classroom}`;
        const res = await fetch(url);
        let resData = res.json();
        if (res.ok) {
            console.log(url);
            console.log(resData);
            return resData;
        } else {
            console.log("에러");
        }
        */
    }

    get_my_classroom();
</script>

<svelte:head>
    <!-- <link rel="stylesheet" href="https://pyscript.net/releases/2024.2.1/core.css" /> -->
    <!-- <script type="module" src="https://pyscript.net/releases/2024.2.1/core.js" ></script> -->
    <link rel="stylesheet" href="https://pyscript.net/latest/pyscript.css" />
    <script defer src="https://pyscript.net/latest/pyscript.js"></script>
</svelte:head>

<py-terminal style="display:none;"></py-terminal>

<div class="container">
    <Error {error} />
    {#if error_message}
        <div class="alert alert-danger">{error_message}</div>
    {/if}
    {#if success_message}
        <div class="alert alert-success">{success_message}</div>
    {/if}
    {#if $student_current_classroom != 0 && problem && answer}
        {#await my_answers_progress_bar}
            로딩중입니다.
        {:then items}
            <!-- 
            <div class="progress-stacked" style="position:sticky; top:0px;">
                {#each Array(num_of_problems) as _, idx}
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
                            {idx + 1}번
                        </div>
                    </div>
                {/each}
            </div>
 -->
        {:catch error}
            에러
        {/await}
        <div
            class="d-flex justify-content-between mt-3"
            style="position:sticky; top:20px;"
        >
            <div>
                <button
                    class="btn btn-success me-5"
                    style="display: inline-block;"
                    on:click={() => {
                        update_current_problem();
                        update_my_answer();
                    }}>저장하기</button
                >
            </div>
            <div>
                <button
                    class="btn btn-success"
                    style="display: inline-block;"
                    on:click={() => {
                        current_problem_seq = 1;
                        get_problem();
                    }}>처음으로</button
                >
                <button
                    class="btn btn-success"
                    style="display: inline-block;"
                    on:click={() => {
                        if (current_problem_seq > 1) {
                            current_problem_seq--;
                            get_problem();
                        } else {
                            alert("첫번째 문제입니다.");
                        }
                    }}>◀ 이전</button
                >
                <button
                    class="btn btn-success"
                    style="display: inline-block;"
                    on:click={() => {
                        if (current_problem_seq < num_of_problems) {
                            current_problem_seq++;
                            get_problem();
                        } else {
                            alert("마지막 문제입니다.");
                        }
                    }}>다음 ▶</button
                >
                <button
                    class="btn btn-success"
                    style="display: inline-block;"
                    on:click={() => {
                        current_problem_seq = num_of_problems;
                        get_problem();
                    }}>마지막으로</button
                >
            </div>
            <div>
                <button
                    class="btn btn-primary"
                    style="display: inline-block;"
                    on:click={() => {
                        if (confirm(`모든 문제의 답안을 제출하시겠습니까?`)) {
                            push("/classroom-result");
                        }
                    }}>{num_of_problems}문제 모두 제출하기</button
                >
            </div>
        </div>
        <div id="problem_title">
            <h5 class="mt-3 border-bottom pb-2">
                나의 클래스룸: 문제 {current_problem_seq}/{num_of_problems}
            </h5>
        </div>
        <div id="problem_detail">
            <h6 class="pt-1 pb-2" style="font-weight:bold; font-size:20px;">
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
                                    on:change={update_my_answer}
                                    value={1}
                                />
                                <label
                                    for=""
                                    class="form-check-label"
                                    id="sel-1"
                                ></label>
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
                                    on:change={update_my_answer}
                                    value={2}
                                />
                                <label
                                    for=""
                                    class="form-check-label"
                                    id="sel-2"
                                ></label>
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
                                    on:change={update_my_answer}
                                    value={3}
                                />
                                <label
                                    for=""
                                    class="form-check-label"
                                    id="sel-3"
                                ></label>
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
                                    on:change={update_my_answer}
                                    value={4}
                                />
                                <label
                                    for=""
                                    class="form-check-label"
                                    id="sel-4"
                                ></label>
                            </div>
                        </li>
                    </ul>
                </div>
            {:else if problem.problem_level == 2}
                <h6 class="pt-2">기본 코드</h6>
                {@html marked.parse(problem.level_2_initcodes)}

                <h6 class="pt-4">실행 결과</h6>
                {@html marked.parse(problem.problem_result)}

                <h6 class="pt-4">주관식문제 답안</h6>
                {#each Array(problem.level_2_num_of_answers) as _, idx}
                    <div class="mb-3">
                        <label for="" class="form-label">문제 {idx + 1}번</label
                        >
                        <input
                            type="text"
                            class="form-control"
                            bind:value={my_answers[idx]}
                        />
                        <!-- on:input={update_my_answer} -->
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
                        bind:value={my_answer}
                        on:keydown={convert_editor}
                    ></textarea>
                </div>
                <button
                    class="btn btn-primary"
                    id="run-button"
                    on:click={run_python}>실행하기</button
                >
                <h6 class="pt-4">파이썬 코드 실행결과</h6>
                <div id="py-container"></div>
                <div id="out" class="pb-4"></div>
            {/if}
        </div>
    {/if}
</div>

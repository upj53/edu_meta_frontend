<script>
    import { link } from "svelte-spa-router";
    import { marked } from "marked";
    import fastapi from "../lib/api";

    let error = { detail: [] };

    let object_list = [];

    export let params = {};
    let problem_idx = params.idx;

    let problem = {
        idx: 0,
        object_idx: 0,
        problem_answer: "",
        problem_question: "",
        problem_content: "",
        problem_result: "",
        level_1_selection_answer: "",
        level_1_selection_1: "",
        level_1_selection_2: "",
        level_1_selection_3: "",
        level_2_initcodes: "",
        level_2_num_of_answers: 0,
        level_2_answer_1: "",
        level_2_answer_2: "",
        level_2_answer_3: "",
        level_2_answer_4: "",
        level_2_answer_5: "",
        level_3_initcodes: "",
    };

    function get_object_list() {
        fastapi(
            "get",
            "/edu/design/object/list",
            {},
            (json) => {
                object_list = json.object_list;
                /*
				// console.log(JSON.stringify(json.object_list));
				for (let i = 0; i < json.object_list.length; i++) {
					// let idx = json.object_list[i]["idx"];
					// object_list[idx] = json.object_list[i];
					object_list.push(json.object_list[i]["object_title"]);
				}
				// console.log(JSON.stringify(object_list));
				*/
            },
            (json_error) => {
                error = json_error;
            },
        );
    }

    function get_problem() {
        fastapi(
            "get",
            `/edu/develop/problem/${problem_idx}`,
            {},
            (json) => {
                problem = json;
                // console.log(JSON.stringify(problem));
            },
            (json_error) => {
                error = json_error;
            },
        );
    }

    get_object_list();
    get_problem();
</script>

<!-- 9줄
    <div class="mb-3">
      <label for=""></label>
      <input
        type="text"
        class="form-control"
        id=""
        bind:value={}
      />
    </div>
    <div class="mb-3">
      <label for=""></label>
      <textarea
        class="form-control"
        rows="3"
        id=""
        bind:value={}
      ></textarea>
    </div>
-->

<div class="container">
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
        disabled
    >
        <option value="0">-----미분류-----</option>
        {#each object_list as object}
            <option value={object.idx}
                >{object.idx}. {object.object_title}</option
            >
        {/each}
    </select>

    <h6 class="pt-5 pb-2" style="font-weight:bold; font-size:20px;">
        {problem.problem_question}
    </h6>

    {#if problem.problem_content}
        <div class="my-3 pb-3">
            {@html marked.parse(problem.problem_content)}
        </div>
    {/if}

    {#if problem.problem_result}
        <div class="my-3 pb-3">
            <h6 class="border-bottom pb-2">실행 결과</h6>
            {@html marked.parse(problem.problem_result)}
        </div>
    {/if}

    {#if problem.problem_level === 1}
        <div class="my-3 pb-3">
            <h6 class="border-bottom pb-2">객관식 문항 정보</h6>

            <ul>
                <li>{problem.level_1_selection_answer} (정답)</li>
                <li>{problem.level_1_selection_1}</li>
                <li>{problem.level_1_selection_2}</li>
                <li>{problem.level_1_selection_3}</li>
            </ul>
        </div>
    {/if}

    {#if problem.problem_level === 2}
        <div class="my-3 pb-3">
            <h6 class="border-bottom pb-2">주관식 문항 정보</h6>

            <h6 class="pt-2">기본 코드</h6>
            <div style="white-space:pre-wrap;">{problem.level_2_initcodes}</div>

            <h6 class="border-bottom pb-2 pt-4">주관식 문항 답안 예시</h6>
            <ol>
                {#if problem.level_2_answer_1.length > 0}
                    <li>
                        문제 1
                        <ul>
                            {#each problem.level_2_answer_1 as answer}
                                <li>{answer}</li>
                            {/each}
                        </ul>
                    </li>
                {/if}
                {#if problem.level_2_answer_2.length > 0}
                    <li>
                        문제 2
                        <ul>
                            {#each problem.level_2_answer_2 as answer}
                                <li>{answer}</li>
                            {/each}
                        </ul>
                    </li>
                {/if}
                {#if problem.level_2_answer_3.length > 0}
                    <li>
                        문제 3
                        <ul>
                            {#each problem.level_2_answer_3 as answer}
                                <li>{answer}</li>
                            {/each}
                        </ul>
                    </li>
                {/if}
                {#if problem.level_2_answer_4.length > 0}
                    <li>
                        문제 4
                        <ul>
                            {#each problem.level_2_answer_4 as answer}
                                <li>{answer}</li>
                            {/each}
                        </ul>
                    </li>
                {/if}
                {#if problem.level_2_answer_5.length > 0}
                    <li>
                        <ul>
                            {#each problem.level_2_answer_5 as answer}
                                <li>{answer}</li>
                            {/each}
                        </ul>
                    </li>
                {/if}
            </ol>

            <h6 class="border-bottom pb-2 pt-4">전체 정답 코드</h6>
            {#each problem.problem_answer as answer}
                <div style="white-space:pre-wrap;">
                    {@html marked.parse(answer)}
                </div>
            {/each}
        </div>
    {/if}

    {#if problem.problem_level === 3}
        <div class="my-3 pb-3">
            <h6 class="border-bottom pb-2">실습형 문항 정보</h6>

            <h6 class="pt-2">기본 코드</h6>
            <div style="white-space:pre-wrap;">{problem.level_3_initcodes}</div>

            <h6 class="pt-4">정답 코드</h6>
            {#each problem.problem_answer as answer}
                <div style="white-space:pre-wrap;">
                    {@html marked.parse(answer)}
                </div>
            {/each}
        </div>
    {/if}

    <a
        use:link
        href="/edu-problem-update/{problem.idx}"
        class="btn btn-primary my-3">수정</a
    >
    <a use:link href="/edu-problems" class="btn btn-primary my-3"
        >목록</a
    >
</div>

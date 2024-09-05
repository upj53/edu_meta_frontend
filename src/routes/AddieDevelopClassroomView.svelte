<script>
    import { link } from "svelte-spa-router";
    import { marked } from "marked";
    import fastapi from "../lib/api";

    let error = { detail: [] };

    export let params = {};
    let classroom_idx = params.idx;
    let classroom = {};
    let object_list = [];
    let score_is_show_true = "";
    let score_is_show_false = "";
    let level_1_num_of_problems = 0;
    let level_2_num_of_problems = 0;
    let level_3_num_of_problems = 0;
    let level_1_real_num_of_problems = 0;
    let level_2_real_num_of_problems = 0;
    let level_3_real_num_of_problems = 0;
    let level_1_problems = [];
    let level_2_problems = [];
    let level_3_problems = [];
    let level_1_problems_scores = [];
    let level_2_problems_scores = [];
    let level_3_problems_scores = [];
    let level_2_problems_dict = {};
    let level_2_problems_sub_scores_percent = [];
    let total_score = 0;

    function calculateTotalScore() {
        // 총합
        total_score = 0;
        for (let i = 0; i < level_1_problems_scores.length; i++) {
            total_score += Number(level_1_problems_scores[i]);
        }
        for (let i = 0; i < level_2_problems_scores.length; i++) {
            total_score += Number(level_2_problems_scores[i]);
        }
        for (let i = 0; i < level_3_problems_scores.length; i++) {
            total_score += Number(level_3_problems_scores[i]);
        }
    }

    async function getClassroom() {
        await fastapi(
            "get",
            `/edu/develop/classroom/${classroom_idx}`,
            {},
            (json1) => {
                fastapi(
                    "get",
                    "/edu/design/object/list",
                    {},
                    (json2) => {
                        classroom = json1.classroom;
                        for (
                            let i = 0;
                            i < json1.level_2_problems.length;
                            i++
                        ) {
                            let obj = json1.level_2_problems[i];
                            level_2_problems_dict[obj["idx"]] = obj;
                        }
                        // console.log(`${JSON.stringify(level_2_problems_dict)}`);
                        object_list = json2.object_list;
                        // console.log(JSON.stringify(classroom));
                        if (classroom.score_is_show == 0) {
                            score_is_show_true = "checked";
                            score_is_show_false = "";
                        } else if (classroom.score_is_show == 1) {
                            score_is_show_true = "";
                            score_is_show_false = "checked";
                        }
                        // 1 단계 문제 세팅
                        level_1_num_of_problems =
                            classroom.level_1_num_of_problems;
                        level_1_real_num_of_problems =
                            classroom.level_1_problems.length;
                        let problems = [];
                        let scores = [];
                        for (let i = 0; i < level_1_num_of_problems; i++) {
                            if (
                                level_1_num_of_problems <=
                                classroom.level_1_problems.length
                            ) {
                                problems[i] = classroom.level_1_problems[i];
                            } else {
                                if (i < classroom.level_1_problems.length) {
                                    problems[i] = classroom.level_1_problems[i];
                                } else {
                                    problems[i] = 0;
                                }
                            }
                            if (
                                classroom.level_1_problems_scores.length >=
                                level_1_num_of_problems
                            ) {
                                scores[i] =
                                    classroom.level_1_problems_scores[i];
                            } else {
                                if (
                                    i < classroom.level_1_problems_scores.length
                                ) {
                                    scores[i] =
                                        classroom.level_1_problems_scores[i];
                                } else {
                                    scores[i] = 0;
                                }
                            }
                        }
                        level_1_problems = problems;
                        level_1_problems_scores = scores;
                        // 2 단계 문제 세팅
                        level_2_num_of_problems =
                            classroom.level_2_num_of_problems;
                        level_2_real_num_of_problems =
                            classroom.level_2_problems.length;
                        problems = [];
                        scores = [];
                        for (let i = 0; i < level_2_num_of_problems; i++) {
                            if (
                                level_2_num_of_problems <=
                                classroom.level_2_problems.length
                            ) {
                                problems[i] = classroom.level_2_problems[i];
                            } else {
                                if (i < classroom.level_2_problems.length) {
                                    problems[i] = classroom.level_2_problems[i];
                                } else {
                                    problems[i] = 0;
                                }
                            }
                            if (
                                classroom.level_2_problems_scores.length >=
                                level_2_num_of_problems
                            ) {
                                scores[i] =
                                    classroom.level_2_problems_scores[i];
                            } else {
                                if (
                                    i < classroom.level_2_problems_scores.length
                                ) {
                                    scores[i] =
                                        classroom.level_2_problems_scores[i];
                                } else {
                                    scores[i] = 0;
                                }
                            }
                        }
                        level_2_problems = problems;
                        level_2_problems_scores = scores;
                        for (let i = 0; i < level_2_problems.length; i++) {
                            let problem_idx = level_2_problems[i];
                            let problem = level_2_problems_dict[problem_idx];
                            let tmp = [];
                            let total = 0;
                            for (
                                let j = 0;
                                j < problem.level_2_scores_precent.length - 1;
                                j++
                            ) {
                                let per = Number(
                                    problem.level_2_scores_precent[j],
                                );
                                if (level_2_problems_scores[j] == 0) {
                                    tmp[j] = 0;
                                } else {
                                    tmp[j] = Math.floor(
                                        level_2_problems_scores[j] * per * 0.01,
                                    );
                                    total += tmp[j];
                                }
                            }
                            if (
                                level_2_problems_scores[
                                    problem.level_2_scores_precent.length - 1
                                ] == 0
                            ) {
                                tmp[problem.level_2_scores_precent.length - 1] =
                                    0;
                            } else {
                                tmp[problem.level_2_scores_precent.length - 1] =
                                    level_2_problems_scores[i] - total;
                            }
                            level_2_problems_sub_scores_percent[i] = tmp;
                        }
                        // console.log( `level_2_problems_scores_percent=${JSON.stringify(level_2_problems_scores_percent)}`,);
                        // 3 단계 문제 세팅
                        level_3_num_of_problems =
                            classroom.level_3_num_of_problems;
                        level_3_real_num_of_problems =
                            classroom.level_3_problems.length;
                        problems = [];
                        scores = [];
                        for (let i = 0; i < level_3_num_of_problems; i++) {
                            if (
                                level_3_num_of_problems <=
                                classroom.level_3_problems.length
                            ) {
                                problems[i] = classroom.level_3_problems[i];
                            } else {
                                if (i < classroom.level_3_problems.length) {
                                    problems[i] = classroom.level_3_problems[i];
                                } else {
                                    problems[i] = 0;
                                }
                            }
                            if (
                                classroom.level_3_problems_scores.length >=
                                level_3_num_of_problems
                            ) {
                                scores[i] =
                                    classroom.level_3_problems_scores[i];
                            } else {
                                if (
                                    i < classroom.level_3_problems_scores.length
                                ) {
                                    scores[i] =
                                        classroom.level_3_problems_scores[i];
                                } else {
                                    scores[i] = 0;
                                }
                            }
                        }
                        level_3_problems = problems;
                        level_3_problems_scores = scores;
                        calculateTotalScore();
                    },
                    (json2_error) => {},
                );
            },
            (json1_error) => {
                error = json1_error;
            },
        );
    }
</script>

<div class="container">
    {#await getClassroom()}
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
            <h5 class="my-3 border-bottom pb-2">학습모듈 정보</h5>

            <h6>수업주제 분류</h6>

            <select
                class="form-select"
                aria-label="Default select example"
                bind:value={classroom.object_idx}
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

            <div class="my-4">
                <label for="" class="fw-bold">클래스룸 제목</label>
                <h6>{classroom.title}</h6>
            </div>

            <h6 class="mt-3 border-bottom pb-2">실시간 채점결과 설정</h6>
            <div>
                <div class="form-check" style="display:inline-block;">
                    <input
                        class="form-check-input"
                        type="radio"
                        name="flexRadioDefault"
                        id="flexRadioDefault1"
                        disabled
                        checked={classroom.score_is_show == 1}
                    />
                    <label class="form-check-label" for="flexRadioDefault1">
                        채점결과 공개
                    </label>
                </div>
                <div
                    class="form-check"
                    style="display:inline-block; margin-left:50px;"
                >
                    <input
                        class="form-check-input"
                        type="radio"
                        name="flexRadioDefault"
                        id="flexRadioDefault2"
                        checked={classroom.score_is_show == 0}
                        disabled
                    />
                    <label class="form-check-label" for="flexRadioDefault2">
                        채점결과 비공개
                    </label>
                </div>
            </div>

            <h6 class="my-3 border-bottom pb-2">단개별 문제의 개수</h6>
            <div class="d-flex">
                <div class="form-floating mb-3">
                    <input
                        type="number"
                        class="form-control"
                        bind:value={level_1_num_of_problems}
                        disabled
                    />
                    <label for="">1단계 문제의 개수</label>
                </div>
                <div class="form-floating mb-3 ms-3">
                    <input
                        type="number"
                        class="form-control"
                        bind:value={level_2_num_of_problems}
                        disabled
                    />
                    <label for="">2단계 문제의 개수</label>
                </div>
                <div class="form-floating mb-3 ms-3">
                    <input
                        type="number"
                        class="form-control"
                        bind:value={level_3_num_of_problems}
                        disabled
                    />
                    <label for="">3단계 문제의 개수</label>
                </div>
            </div>

            <h6 class="my-3 border-bottom pb-2">1단계 문제</h6>
            <ul>
                {#each Array(level_1_problems.length) as _, idx}
                    <li class="my-3">
                        <div class="d-flex">
                            문제 인덱스:
                            <input
                                type="number"
                                class="form-control ms-1 me-5"
                                style="width:100px; margin-top:-5px;"
                                bind:value={level_1_problems[idx]}
                                disabled
                            />
                            배점:
                            <input
                                type="number"
                                class="form-control fw-bold ms-1 me-5"
                                style="width:100px; margin-top:-5px;"
                                bind:value={level_1_problems_scores[idx]}
                                on:change={calculateTotalScore}
                                disabled
                            />
                        </div>
                    </li>
                {/each}
            </ul>

            <h6 class="my-3 border-bottom pb-2">2단계 문제</h6>
            <ul>
                {#each Array(level_2_problems.length) as _, idx1}
                    <li class="my-3">
                        <div class="d-flex">
                            문제 인덱스:
                            <input
                                type="number"
                                class="form-control ms-1 me-5"
                                style="width:100px; margin-top:-5px;"
                                bind:value={level_2_problems[idx1]}
                                disabled
                            />
                            배점:
                            <input
                                type="number"
                                class="form-control fw-bold ms-1 me-5"
                                style="width:100px; margin-top:-5px;"
                                bind:value={level_2_problems_scores[idx1]}
                                on:change={calculateTotalScore}
                                disabled
                            />
                            하위문제 배점 (
                            {#each level_2_problems_sub_scores_percent[idx1] as score, idx2}
                                <span>{idx2 + 1}번:</span><span class="fw-bold"
                                    >{score}점</span
                                >
                                {#if level_2_problems_sub_scores_percent[idx1].length - 1 != idx2}
                                    <span class="me-2">,</span>
                                {/if}
                            {/each}
                            )
                        </div>
                    </li>
                {/each}
            </ul>

            <h6 class="my-3 border-bottom pb-2">3단계 문제</h6>
            <ul>
                {#each Array(level_3_problems.length) as _, idx}
                    <li class="my-3">
                        <div class="d-flex">
                            문제 인덱스:
                            <input
                                type="number"
                                class="form-control ms-1 me-5"
                                style="width:100px; margin-top:-5px;"
                                bind:value={level_3_problems[idx]}
                                disabled
                            />
                            배점:
                            <input
                                type="number"
                                class="form-control fw-bold ms-1 me-5"
                                style="width:100px; margin-top:-5px;"
                                bind:value={level_3_problems_scores[idx]}
                                on:change={calculateTotalScore}
                                disabled
                            />
                        </div>
                    </li>
                {/each}
            </ul>

            <hr style="border: double 1px gray;" />
            <div class="fs-5" style="padding-left:220px;">
                배점 총합: <b class="ms-2">{total_score} 점</b>
            </div>

            <p class="my-3">
                <a
                    use:link
                    href="/edu-classroom-update/{classroom_idx}"
                    class="btn btn-primary">수정</a
                >
                <a use:link href="/edu-classrooms" class="btn btn-primary"
                    >목록</a
                >
            </p>
        </form>
    {/await}
</div>

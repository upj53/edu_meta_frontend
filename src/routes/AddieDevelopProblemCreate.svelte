<script>
    import Error from "../components/Error.svelte";
    import fastapi from "../lib/api";

    let object_list = [];
    let problem_ct_1 = false;
    let problem_ct_2 = false;
    let problem_ct_3 = false;
    let problem_ct_4 = false;
    let problem_ct_5 = false;
    let problem_ct_6 = false;
    let problem_ct_7 = false;
    let problem_ct_8 = false;
    let problem_ct_9 = false;

    let error = { detail: [] };
    let problem_title = "";
    let problem_classify;
    let problem_ct_list = [
        problem_ct_1,
        problem_ct_2,
        problem_ct_3,
        problem_ct_4,
        problem_ct_5,
        problem_ct_6,
        problem_ct_7,
        problem_ct_8,
        problem_ct_9,
    ];
    let problem_detail = "";
    let problem_start_code = "";
    let problem_solution_code = "";

    function get_object_list() {
        fastapi(
            "get",
            "/edu/design/object/list",
            {},
            (json) => {
                object_list = json.object_list;
            },
            (json_error) => {
                error = json_error;
            },
        );
    }

    function post_problem(event) {
        event.preventDefault();
        let params = {
            problem_title: problem_title,
            problem_classify: problem_classify,
            problem_ct_list: problem_ct_list,
            problem_detail: problem_detail,
            problem_start_code: problem_start_code,
            problem_solution_code: problem_solution_code,
        };
        // console.log(JSON.stringify(params));
    }

    get_object_list();
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
    <h5 class="my-3 border-bottom pb-2">문제 생성</h5>
    <Error {error} />
    <form method="post">
        <div class="mb-3">
            <label for="problem_title">문제 이름</label>
            <input
                placeholder="문제 이름을 입력해주세요."
                type="text"
                class="form-control"
                id="problem_title"
                bind:value={problem_title}
            />
        </div>

        <div class="mb-3">
            <label for="problem_classify">수업주제 분류</label>
            <select
                class="form-select"
                aria-label="Default select example"
                bind:value={problem_classify}
                id="problem_classify"
            >
                <option selected>수업주제를 분류해주세요.</option>
                <option value="0">-----미분류-----</option>
                {#each object_list as object}
                    <option value={object.idx}
                        >{object.idx}. {object.object_title}</option
                    >
                {/each}
                <!--
        <option value="1">01. 자료형</option>
        <option value="2">02. 1차원 배열</option>
        <option value="3">03. 2차원 배열</option>
        <option value="4">04. 입출력</option>
        <option value="5">05. 조건문</option>
        <option value="6">06. 반복문</option>
        <option value="7">07. 클래스와 인스턴스</option>
        <option value="8">08. 문제 분해와 모델링</option>
        <option value="9">09. 정렬 알고리즘</option>
        <option value="10">10. 탐색 알고리즘</option>
-->
            </select>
        </div>

        <div class="mb-3">
            <label for="">컴퓨팅 사고력</label><br />
            <!--https://www.javatpoint.com/how-to-get-all-checked-checkbox-value-in-javascript-->
            <span class="form-text"
                >문제를 해결하기 위해 필요한 컴퓨팅 사고력을 선택해주세요.
                (복수선택 가능)</span
            >
            <!-- 12줄
      <div class="form-check">
        <input
          class="form-check-input"
          type="checkbox"
          name="problem_ct"
          id="problem_ct_"
          value=""
        />
        <label class="form-check-label" for="problem_ct_">
          <span class="form-text"></span>
        </label>
      </div>
      -->
            <div class="form-check">
                <input
                    class="form-check-input"
                    type="checkbox"
                    id="problem_ct_1"
                    bind:checked={problem_ct_1}
                />
                <label class="form-check-label" for="problem_ct_1">
                    자료수집 <span class="form-text"
                        >적당한 정보를 수집하는 과정</span
                    >
                </label>
            </div>
            <div class="form-check">
                <input
                    class="form-check-input"
                    type="checkbox"
                    id="problem_ct_2"
                    bind:checked={problem_ct_2}
                />
                <label class="form-check-label" for="problem_ct_2">
                    자료 분석 <span class="form-text"
                        >데이터의 의미를 만들고, 패턴을 발견하고, 결론 그리기</span
                    >
                </label>
            </div>
            <div class="form-check">
                <input
                    class="form-check-input"
                    type="checkbox"
                    id="problem_ct_3"
                    bind:checked={problem_ct_3}
                />
                <label class="form-check-label" for="problem_ct_3">
                    자료표현 <span class="form-text"
                        >적절한 그래프, 차트, 단어, 이미지 등으로 데이터
                        구성하고 묘사하기</span
                    >
                </label>
            </div>
            <div class="form-check">
                <input
                    class="form-check-input"
                    type="checkbox"
                    id="problem_ct_4"
                    bind:checked={problem_ct_4}
                />
                <label class="form-check-label" for="problem_ct_4">
                    문제분해 <span class="form-text"
                        >관리할 수 있게 작은 단위로 작업 나누기</span
                    >
                </label>
            </div>
            <div class="form-check">
                <input
                    class="form-check-input"
                    type="checkbox"
                    id="problem_ct_5"
                    bind:checked={problem_ct_5}
                />
                <label class="form-check-label" for="problem_ct_5">
                    추상화 <span class="form-text"
                        >주요 아이디어로 정의하기 위해 복잡성 줄이기</span
                    >
                </label>
            </div>
            <div class="form-check">
                <input
                    class="form-check-input"
                    type="checkbox"
                    id="problem_ct_6"
                    bind:checked={problem_ct_6}
                />
                <label class="form-check-label" for="problem_ct_6">
                    알고리즘과 절차 <span class="form-text"
                        >문제를 해결하거나 어떤 결과를 달성하기 위해 단계의 순서
                        나열하기</span
                    >
                </label>
            </div>
            <div class="form-check">
                <input
                    class="form-check-input"
                    type="checkbox"
                    id="problem_ct_7"
                    bind:checked={problem_ct_7}
                />
                <label class="form-check-label" for="problem_ct_7">
                    자동화 <span class="form-text"
                        >컴퓨터나 기계를 가지고 반복적이거나 지루한 작업을
                        수행하기</span
                    >
                </label>
            </div>
            <div class="form-check">
                <input
                    class="form-check-input"
                    type="checkbox"
                    id="problem_ct_8"
                    bind:checked={problem_ct_8}
                />
                <label class="form-check-label" for="problem_ct_8">
                    시뮬레이션 <span class="form-text"
                        >프로세스의 모델과 표현 모델을 사용하여 실험중인 실험을
                        수행하는 것을 포함</span
                    >
                </label>
            </div>
            <div class="form-check">
                <input
                    class="form-check-input"
                    type="checkbox"
                    id="problem_ct_9"
                    bind:checked={problem_ct_9}
                />
                <label class="form-check-label" for="problem_ct_9">
                    병렬화 <span class="form-text"
                        >동시에 공통의 목표에 도달하는 작업을 수행하기 위해
                        자원을 구성하기</span
                    >
                </label>
            </div>
        </div>

        <div class="mb-3">
            <label for="problem_detail">문제 내용</label>
            <textarea
                placeholder="문제 내용을 입력해주세요. 마크다운(markdown)으로 작성할 수 있습니다."
                class="form-control"
                rows="10"
                id="problem_detail"
                bind:value={problem_detail}
            ></textarea>
        </div>

        <div class="mb-3">
            <label for="">시작 프로그래밍 코드</label>
            <textarea
                placeholder="학습을 시작할 때 학생에게 제공하는 코드를 작성해주세요."
                class="form-control"
                rows="10"
                id="problem_start_code"
                bind:value={problem_start_code}
            ></textarea>
        </div>

        <div class="mb-3">
            <label for="">정답 프로그래밍 코드</label>
            <textarea
                placeholder="문제의 정답 코드를 작성해주세요."
                class="form-control"
                rows="10"
                id="problem_solution_code"
                bind:value={problem_solution_code}
            ></textarea>
        </div>

        <div class="mb-3">
            <div class="row justify-content-evenly">
                <button class="col-3 btn btn-outline-primary">임시저장</button>
                <button
                    class="col-3 btn btn-primary"
                    type="submit"
                    on:click={post_problem}>저장하기</button
                >
            </div>
        </div>
    </form>
</div>

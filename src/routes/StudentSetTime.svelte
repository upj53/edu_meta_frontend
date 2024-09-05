<script>
    import { link, push } from "svelte-spa-router";
    import fastapi from "../lib/api";
    import Error from "../components/Error.svelte";
    import { userid } from "../lib/store";
    import moment from "moment/min/moment-with-locales";
    moment.locale("ko");

    let error = { detail: [] };
    let error_message = "";
    let success_message = "";

    let current_classroom = 0;

    let my_classroom_list = [];
    let my_classroom_dict = {};
    let my_classroom_idx = 0;
    let classroom_list = [];
    let classroom_dict = {};
    let time_goal_status = 0;
    let time_goal_status_display = 0;
    let time_goal_at = null;
    let time_goal = null;
    let time_goal_delay = [];

    var c_time = new Date();
    var current_time = new Date(
        c_time.getFullYear(),
        c_time.getMonth(),
        c_time.getDate(),
        c_time.getHours(),
        c_time.getMinutes(),
        c_time.getSeconds(),
    );
    var current_times = [
        new Date(
            c_time.getFullYear(),
            c_time.getMonth(),
            c_time.getDate(),
            c_time.getHours() + 1,
            c_time.getMinutes(),
            c_time.getSeconds(),
        ),
        new Date(
            c_time.getFullYear(),
            c_time.getMonth(),
            c_time.getDate(),
            c_time.getHours() + 2,
            c_time.getMinutes(),
            c_time.getSeconds(),
        ),
        new Date(
            c_time.getFullYear(),
            c_time.getMonth(),
            c_time.getDate(),
            c_time.getHours() + 3,
            c_time.getMinutes(),
            c_time.getSeconds(),
        ),
    ];

    let timerId = setInterval(() => {
        let c_now = new Date();
        current_time = new Date(
            c_now.getFullYear(),
            c_now.getMonth(),
            c_now.getDate(),
            c_now.getHours(),
            c_now.getMinutes(),
            c_now.getSeconds(),
        );
        for (let i = 0; i < current_times.length; i++) {
            current_times[i] = new Date(
                c_now.getFullYear(),
                c_now.getMonth(),
                c_now.getDate(),
                c_now.getHours() + (i + 1),
                c_now.getMinutes(),
                c_now.getSeconds(),
            );
        }
    }, 1000);

    function save_my_time(event) {
        event.preventDefault();
        if (time_goal_status_display == 0) {
            error_message = `학습시간 목표를 선택해주세요.`;
            return false;
        }
        if (
            !confirm("목표시간 설정 후 수정할 수 없습니다.\n계속하시겠습니까?")
        ) {
            return false;
        }
        let update_params = {
            time_goal_status: time_goal_status_display,
        };
            // idx: 0,
            // userid: $userid,
            // current_classroom: current_classroom,
            // time_goal_at: `${current_time.getFullYear()}-${(current_time.getMonth() + 1).toString().padStart(2, "0")}-${current_time.getDate().toString().padStart(2, "0")}T${current_time.getHours()}:${current_time.getMinutes()}:${current_time.getSeconds()}.000Z`,
            // time_goal: `${current_times[time_goal_status_display - 1].getFullYear()}-${(current_times[time_goal_status_display - 1].getMonth() + 1).toString().padStart(2, "0")}-${current_times[time_goal_status_display - 1].getDate().toString().padStart(2, "0")}T${current_times[time_goal_status_display - 1].getHours()}:${current_times[time_goal_status_display - 1].getMinutes()}:${current_times[time_goal_status_display - 1].getSeconds()}.000Z`,
            // time_goal_delay: [],
        // console.log(`update_params=${JSON.stringify(update_params)}`)
        // return false;
        fastapi(
            "put",
            `/edu/student/update/my-classroom-time-set/${my_classroom_idx}`,
            update_params,
            (json) => {
                // $student_current_classroom = current_classroom;
                // success_message = `'${classroom_dict[current_classroom].title}' 으로 선택되었습니다.`;
                // success_message = `'${classroom_dict[current_classroom].title}' 으로 선택되었습니다.`;
                error_message = "";
                // return false;
                get_classroom_list();
            },
            (json_error) => {},
        );
    }

    function get_classroom_list() {
        fastapi(
            "get",
            `/edu/user/${$userid}`,
            {},
            (json0) => {
                current_classroom = json0.current_classroom;
                // console.log(JSON.stringify(current_classroom));
                if (current_classroom == 0) {
                    error_message = `클래스룸 학습설정이 완료되어 있지 않습니다. 학습할 주제를 선택해주세요.`;
                } else {
                    error_message = "";
                }
                fastapi(
                    "get",
                    "/edu/develop/classroom/list",
                    {},
                    (json1) => {
                        if (current_classroom == 0) {
                            return false;
                        }
                        fastapi(
                            "get",
                            `/edu/student/my-classroom/${$userid}/list`,
                            {},
                            (json2) => {
                                my_classroom_list = json2.my_classroom_list;
                                // console.log( `my_classroom_list=\n${JSON.stringify(my_classroom_list)}`,);
                                for (
                                    let i = 0;
                                    i < my_classroom_list.length;
                                    i++
                                ) {
                                    let obj = my_classroom_list[i];
                                    my_classroom_dict[obj["classroom_idx"]] =
                                        obj;
                                }
                                my_classroom_idx = my_classroom_dict[current_classroom].idx;
                                time_goal_status =
                                    my_classroom_dict[current_classroom]
                                        .time_goal_status;
                                time_goal_status_display = time_goal_status;
                                time_goal_at =
                                    my_classroom_dict[current_classroom]
                                        .time_goal_at;
                                time_goal =
                                    my_classroom_dict[current_classroom]
                                        .time_goal;
                                time_goal_delay =
                                    my_classroom_dict[current_classroom]
                                        .time_goal_delay;
                                // console.log( `my_classroom_dict=\n${JSON.stringify(my_classroom_dict)}`,);
                                // console.log( `my_classroom_dict[now]=\n${JSON.stringify(my_classroom_dict[current_classroom])}`,);
                                // console.log(`current_classroom = ${current_classroom}`)
                                // console.log(`time_goal_status = ${time_goal_status}`);
                                // console.log(`time_goal_at = ${time_goal_at}`);
                                // console.log(`time_goal = ${time_goal}`);
                                classroom_list = json1.classroom_list;
                                for (
                                    let i = 0;
                                    i < classroom_list.length;
                                    i++
                                ) {
                                    let obj = classroom_list[i];
                                    classroom_dict[obj["idx"]] = obj;
                                }
                                // console.log( `classroom_list=\n${JSON.stringify(classroom_list)}`,);
                            },
                            (json2_error) => {},
                        );
                    },
                    (json1_error) => {},
                );
            },
            (json_error) => {},
        );
    }
</script>

<div class="container">
    {#await get_classroom_list()}
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
    {:then}
        <form>
            <h5 class="my-3 pt-4 pb-2 fw-bold">학습시간 목표설정</h5>

            <Error {error} />
            {#if error_message}
                <div class="alert alert-danger">{error_message}</div>
            {/if}
            {#if success_message}
                <div class="alert alert-success">{success_message}</div>
            {/if}

            <ul class="list-group my-3">
                <li class="list-group-item">
                    <input
                        type="radio"
                        class="form-check-input"
                        name="classroom-selection"
                        bind:group={time_goal_status_display}
                        value={0}
                    />
                    <label for="" class="form-check-label"
                        >언제까지 학습을 완료할지 학습시간 목표를 선택해주세요.</label
                    >
                </li>
                {#each Array(3) as _, idx}
                    <li class="list-group-item">
                        {#if time_goal_status == 0}
                            <input
                                type="radio"
                                class="form-check-input"
                                name="classroom-selection"
                                bind:group={time_goal_status_display}
                                value={idx + 1}
                            />
                            <label for="" class="form-check-label">
                                <span style="font-weight:bold;"
                                    >{idx + 1} 시간</span
                                >
                                <span
                                    style="margin-left:10px;"
                                    id="current_time_{idx + 1}"
                                    >(<span style="color:blue;"
                                        >{moment(current_times[idx]).format(
                                            "YYYY년 MM월 DD일 a hh:mm",
                                        )}</span
                                    >
                                    까지 학습을 완료할 수 있다.)</span
                                >
                            </label>
                        {:else}
                            <input
                                type="radio"
                                class="form-check-input"
                                name="classroom-selection"
                                bind:group={time_goal_status}
                                value={idx + 1}
                                disabled
                            />
                            <label for="" class="form-check-label">
                                <span style="font-weight:bold;"
                                    >{idx + 1} 시간</span
                                >
                            </label>
                        {/if}
                    </li>
                {/each}
            </ul>

            {#if time_goal_status == 0}
                <p class="my-3 mx-1">
                    현재시간
                    <span
                        id="current_time"
                        style="color:blue; font-weight:bold;"
                        >{moment(current_time).format(
                            "YYYY년 MM월 DD일 a hh:mm:ss",
                        )}</span
                    >
                </p>

                {#if current_classroom == 0}
                    <button class="btn btn-primary mt-1" type="submit" disabled
                        >현재시간부터 시작하는 목표 설정하기</button
                    >
                {:else}
                    <button
                        class="btn btn-primary mt-1"
                        type="submit"
                        on:click={save_my_time}
                        >현재시간부터 시작하는 목표 설정하기</button
                    >
                {/if}
            {:else}
                <div class="alert alert-info">
                    <span class="fw-bold"
                        >{moment(time_goal).format("YYYY년 MM월 DD일 a hh:mm")}
                    </span> 까지 학습을 완료해주세요.
                </div>
                <button class="btn btn-primary mt-1" type="submit" disabled
                    >목표설정 완료</button
                >
            {/if}

            <div class="mt-4">
                ※ 목표시간 설정 후 수정할 수 없습니다.<br />
                &nbsp;&nbsp;&nbsp;목표시간을 늘리려면
                <span class="fw-bold">"학습설정 ＞ 목표 학습시간 연장"</span>
                에서 목표 학습시간을 연장해주세요.
            </div>
        </form>
    {/await}
</div>

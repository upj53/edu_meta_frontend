<script>
    import { link, push } from "svelte-spa-router";
    import fastapi from "../lib/api";
    import Error from "../components/Error.svelte";
    import { userid, student_current_classroom } from "../lib/store";
    import moment from "moment/min/moment-with-locales";
    moment.locale("ko");

    let error = { detail: [] };
    let error_message = "";
    let success_message = "";

    let current_classroom = 0;
    let current_classroom_display = 0;

    let my_classroom_list = [];
    let my_classroom_dict = {};
    let my_classroom = {};
    let my_classroom_created_at = "";
    let classroom_list = [];
    let classroom_dict = {};
    let time_goal_status = 0;
    let time_goal_at = null;
    let time_goal = null;
    let time_goal_delay = [];

    var c_time = new Date();
    var current_time = new Date(
        c_time.getFullYear(),
        c_time.getMonth(),
        c_time.getDay(),
        c_time.getHours(),
        c_time.getMinutes(),
        c_time.getSeconds(),
    );
    var current_times = [
        new Date(
            c_time.getFullYear(),
            c_time.getMonth(),
            c_time.getDay(),
            c_time.getHours() + 1,
            c_time.getMinutes(),
            c_time.getSeconds(),
        ),
        new Date(
            c_time.getFullYear(),
            c_time.getMonth(),
            c_time.getDay(),
            c_time.getHours() + 2,
            c_time.getMinutes(),
            c_time.getSeconds(),
        ),
        new Date(
            c_time.getFullYear(),
            c_time.getMonth(),
            c_time.getDay(),
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
            c_now.getDay(),
            c_now.getHours(),
            c_now.getMinutes(),
            c_now.getSeconds(),
        );
        for (let i = 0; i < current_times.length; i++) {
            current_times[i] = new Date(
                c_now.getFullYear(),
                c_now.getMonth(),
                c_now.getDay(),
                c_now.getHours() + (i + 1),
                c_now.getMinutes(),
                c_now.getSeconds(),
            );
        }
    }, 1000);

    function save_my_classroom(event) {
        event.preventDefault();
        let update_params = {};
        if (current_classroom == current_classroom_display) {
            // alert("이미 선택했습니다.");
            return false;
        } else {
            update_params = {
                userid: $userid,
                current_classroom: current_classroom_display,
            };
        }
        // console.log(`update_params=${JSON.stringify(update_params)}`);
        // return false;
        fastapi(
            "put",
            `/edu/student/update/my-classroom/${$userid}`,
            update_params,
            (json) => {
                success_message = `학습모듈이 '${classroom_dict[current_classroom_display].title}' 으로 선택되었습니다. 학습시간 목표를 설정해주세요.`;
                current_classroom = current_classroom_display;
                $student_current_classroom = current_classroom_display;
                error_message = "";
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
                current_classroom_display = current_classroom;
                // console.log(`current_classroom=${JSON.stringify(current_classroom)}`);
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
                            classroom_list = json1.classroom_list;
                            for (let i = 0; i < classroom_list.length; i++) {
                                let obj = classroom_list[i];
                                classroom_dict[obj["idx"]] = obj;
                            }
                            // console.log( `classroom_list=\n${JSON.stringify(classroom_list)}`,);
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
                                // my_classroom_idx = my_classroom_dict[current_classroom].idx;
                                my_classroom =
                                    my_classroom_dict[current_classroom];
                                time_goal_status =
                                    my_classroom_dict[current_classroom]
                                        .time_goal_status;
                                time_goal_at =
                                    my_classroom_dict[current_classroom]
                                        .time_goal_at;
                                time_goal =
                                    my_classroom_dict[current_classroom]
                                        .time_goal;
                                time_goal_delay =
                                    my_classroom_dict[current_classroom]
                                        .time_goal_delay;
                                my_classroom_created_at =
                                    my_classroom_dict[current_classroom]
                                        .created_at;
                                // console.log( `my_classroom_dict=\n${JSON.stringify(my_classroom_dict)}`,);
                                // console.log( `my_classroom_dict[now]=\n${JSON.stringify(my_classroom_dict[current_classroom])}`,);
                                // console.log(`current_classroom = ${current_classroom}`)
                                // console.log(`time_goal_status = ${time_goal_status}`)
                                // console.log(`time_goal_at = ${time_goal_at}`)
                                // console.log(`time_goal = ${time_goal}`)
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
                                // console.log( `classroom_dict=\n${JSON.stringify(classroom_dict)}`,);
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
                <span class="visually-hidden">로딩중입니다 ...</span>
            </div>
        </div>
    {:then}
        <form>
            <h5 class="my-3 pb-2 fw-bold">학습모듈 선택</h5>

            <Error {error} />
            {#if error_message}
                <div class="alert alert-danger">{error_message}</div>
            {/if}
            {#if success_message}
                <div class="alert alert-success">{success_message}</div>
            {/if}

            {#if current_classroom == 0}
                <ul class="list-group my-3">
                    <li class="list-group-item">
                        <input
                            type="radio"
                            class="form-check-input"
                            name="classroom-selection"
                            bind:group={current_classroom_display}
                            value={0}
                        />
                        <label for="" class="form-check-label"
                            >지금 학습할 주제를 선택해주세요.</label
                        >
                    </li>
                    {#each classroom_list as classroom}
                        <li class="list-group-item">
                            <input
                                type="radio"
                                class="form-check-input"
                                name="classroom-selection"
                                bind:group={current_classroom_display}
                                value={classroom.idx}
                            />
                            <label for="" class="form-check-label">
                                <span style="font-weight:bold;"
                                    >{classroom.idx}. {classroom.title}</span
                                >
                                {#if classroom.score_is_show == 0}
                                    <span style="font-size:12px; color:darkred;"
                                        >(실시간 채점결과 비공개)</span
                                    >
                                {:else if classroom.score_is_show == 1}
                                    <span
                                        style="font-size:12px; color:mediumblue;"
                                        >(실시간 채점결과 공개)</span
                                    >
                                {/if}
                            </label>
                        </li>
                    {/each}
                </ul>
            {:else}
                <ul class="list-group my-3">
                    <li class="list-group-item">
                        <input
                            type="radio"
                            class="form-check-input"
                            name="classroom-selection"
                            bind:group={current_classroom_display}
                            value={0}
                        />
                        <label for="" class="form-check-label"
                            >지금 학습할 주제를 선택해주세요.</label
                        >
                    </li>
                    {#each classroom_list as classroom}
                        <li class="list-group-item">
                            <input
                                type="radio"
                                class="form-check-input"
                                name="classroom-selection"
                                bind:group={current_classroom_display}
                                value={classroom.idx}
                            />
                            <label for="" class="form-check-label">
                                <span style="font-weight:bold;"
                                    >{classroom.idx}. {classroom.title}</span
                                >
                                {#if classroom.score_is_show == 0}
                                    <span style="font-size:12px; color:darkred;"
                                        >(실시간 채점결과 비공개)</span
                                    >
                                {:else if classroom.score_is_show == 1}
                                    <span
                                        style="font-size:12px; color:mediumblue;"
                                        >(실시간 채점결과 공개)</span
                                    >
                                {/if}
                            </label>
                        </li>
                    {/each}
                </ul>
            {/if}

            <button
                class="btn btn-primary mt-1"
                type="submit"
                on:click={save_my_classroom}>학습모듈 선택하기</button
            >

            <button
                class="btn btn-outline-primary mt-1 ms-3"
                on:click={() => {
                    push("/set-time");
                }}>다음 ＞ 학습시간 목표설정</button
            >
        </form>
    {/await}
</div>

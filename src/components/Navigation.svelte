<script>
    import { link } from "svelte-spa-router";
    import {
        access_token,
        userid,
        is_student,
        is_teacher,
        student_current_classroom,
    } from "../lib/store";

    let m_side = "35px";
    let score_show_idx_list = [1, 2, 3, 4];
</script>

<!--네비게이션 바-->
<nav
    class="navbar navbar-expand-sm bg-body-tertiary mb-2"
    style="z-index:10000"
>
    <div class="container-fluid">
        <a class="navbar-brand" use:link href="/">MC-Learn</a>
        <button
            class="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNavDropdown"
            aria-controls="navbarNavDropdown"
            aria-expanded="false"
            aria-label="Toggle navigation"
        >
            <span class="navbar-toggler-icon"></span>
        </button>
        <div
            class="collapse navbar-collapse justify-content-end"
            id="navbarNavDropdown"
        >
            <ul class="navbar-nav">
                <!-- 학생 계정 -->
                {#if $is_student}
                    <li class="nav-item" style="width:30px;"></li>
                    {#if $student_current_classroom == 0}
                        <li class="nav-item" style="margin: 0 {m_side} 0 0;">
                            <a
                                class="nav-link"
                                href={"#"}
                                on:click={() => {
                                    alert(
                                        "학습설정 메뉴에서 학습모듈을 선택해주세요.",
                                    );
                                    return false;
                                }}>나의 학습모듈</a
                            >
                        </li>
                    {:else if score_show_idx_list.includes($student_current_classroom)}
                        <li class="nav-item" style="margin: 0 {m_side} 0 0;">
                            <a class="nav-link" use:link href="/my-classroom"
                                >나의 학습모듈</a
                            >
                        </li>
                    {:else}
                        <li class="nav-item" style="margin: 0 {m_side} 0 0;">
                            <a class="nav-link" use:link href="/my-module"
                                >나의 학습모듈</a
                            >
                        </li>
                    {/if}
                    <li class="nav-item" style="margin: 0 {m_side} 0 0;">
                        <a class="nav-link" use:link href="/classroom-result"
                            >학습 결과</a
                        >
                    </li>
                    <li
                        class="nav-item dropdown"
                        style="margin: 0 {m_side} 0 0;"
                    >
                        <a
                            href={null}
                            class="nav-link dropdown-toggle"
                            role="button"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                        >
                            학습 설정</a
                        >
                        <ul class="dropdown-menu">
                            <li>
                                <a
                                    use:link
                                    href="/set-classroom"
                                    class="dropdown-item">학습모듈 선택</a
                                >
                            </li>
                            <li>
                                <a
                                    use:link
                                    href="/set-time"
                                    class="dropdown-item">학습시간 목표설정</a
                                >
                            </li>
                            <li>
                                <a
                                    use:link
                                    href="/set-delaytime"
                                    class="dropdown-item">목표 학습시간 연장</a
                                >
                            </li>
                        </ul>
                    </li>
                    <li class="nav-item text-center">
                        <a
                            use:link
                            href="/user-update"
                            class="nav-link"
                            style="line-height:75%; padding-top:14px;"
                            >나의 정보<br />
                            <span style="font-size:12px; color:dimgray;"
                                >{$userid}</span
                            ></a
                        >
                    </li>
                    <li class="nav-item">
                        <a
                            class="nav-link"
                            use:link
                            href="/"
                            on:click={() => {
                                $access_token = "";
                                $userid = "";
                                $is_student = false;
                                $is_teacher = false;
                                $student_current_classroom = 0;
                            }}>로그아웃</a
                        >
                    </li>
                    <li class="nav-item" style="width:30px;"></li>
                    <!--  교사 계정 -->
                {:else if $is_teacher}
                    <li
                        class="nav-item dropdown"
                        style="margin: 0 {m_side} 0 0;"
                    >
                        <a
                            href={null}
                            class="nav-link dropdown-toggle"
                            role="button"
                            data-bs-toggle="dropdown"
                            aria-expanded="false">학생 관리</a
                        >
                        <ul class="dropdown-menu">
                            <li>
                                <a
                                    use:link
                                    href="/edu-students"
                                    class="dropdown-item">학생 목록</a
                                >
                            </li>
                            <li>
                                <a
                                    use:link
                                    href="/user-create"
                                    class="dropdown-item">학생계정 생성</a
                                >
                            </li>
                            <!--
                            <li><hr class="dropdown-divider" /></li>
                            <li>
                                <a
                                    use:link
                                    href="/user-create?teacher"
                                    class="dropdown-item">교사계정 생성</a
                                >
                            </li>
                            -->
                        </ul>
                    </li>
                    <li
                        class="nav-item dropdown"
                        style="margin: 0 {m_side} 0 0;"
                    >
                        <a
                            href={null}
                            class="nav-link dropdown-toggle"
                            role="button"
                            data-bs-toggle="dropdown"
                            aria-expanded="false">교육 과정</a
                        >
                        <ul class="dropdown-menu">
                            <li>
                                <a
                                    use:link
                                    href="/edu-subjects"
                                    class="dropdown-item">교육과정 목록</a
                                >
                            </li>
                            <li>
                                <a
                                    href={null}
                                    class="dropdown-item"
                                    on:click={() => {
                                        alert("현재 비활성 상태입니다.");
                                        return false;
                                    }}>교육과정 생성</a
                                >
                            </li>
                            <li><hr class="dropdown-divider" /></li>
                            <li>
                                <a
                                    use:link
                                    href="/edu-objects"
                                    class="dropdown-item">수업주제 목록</a
                                >
                            </li>
                            <li>
                                <a
                                    href={"#"}
                                    class="dropdown-item"
                                    on:click={() => {
                                        alert("현재 비활성 상태입니다.");
                                        return false;
                                    }}>수업주제 생성</a
                                >
                            </li>
                        </ul>
                    </li>
                    <li
                        class="nav-item dropdown"
                        style="margin: 0 {m_side} 0 0;"
                    >
                        <a
                            href={null}
                            class="nav-link dropdown-toggle"
                            role="button"
                            data-bs-toggle="dropdown"
                            aria-expanded="false">학습 관리</a
                        >
                        <ul class="dropdown-menu">
                            <li>
                                <a
                                    use:link
                                    href="/edu-problems"
                                    class="dropdown-item">문제 목록</a
                                >
                            </li>
                            <li>
                                <a
                                    href={null}
                                    on:click={() => {
                                        alert("현재 비활성 상태입니다.");
                                        return false;
                                    }}
                                    class="dropdown-item">문제 생성</a
                                >
                            </li>
                            <li><hr class="dropdown-divider" /></li>
                            <li>
                                <a
                                    use:link
                                    href="/edu-classrooms"
                                    class="dropdown-item">학습모듈 목록</a
                                >
                            </li>
                            <li>
                                <a
                                    use:link
                                    href="/edu-classroom-create"
                                    class="dropdown-item"
                                    on:click={() => {
                                        alert("현재 비활성 상태입니다.");
                                        return false;
                                    }}
                                    >학습모듈 생성<br /><span
                                        style="margin-left:10px; font-size:12px; color:darkred;"
                                        >(실시간 채점결과 비공개)</span
                                    ></a
                                >
                            </li>
                            <li>
                                <a
                                    use:link
                                    href="/edu-classroom-create"
                                    class="dropdown-item"
                                    on:click={() => {
                                        alert("현재 비활성 상태입니다.");
                                        return false;
                                    }}
                                    >학습모듈 생성<br /><span
                                        style="margin-left:10px; font-size:12px; color:mediumblue;"
                                        >(실시간 채점결과 공개)</span
                                    ></a
                                >
                            </li>
                            <li><hr class="dropdown-divider" /></li>
                            <!-- <li> <a href={null} class="dropdown-item" on:click={() => { alert("현재 비활성 상태입니다."); return false; }}>수업 일정 관리</a > </li> -->
                            <!-- <li><hr class="dropdown-divider" /></li> -->
                            <li>
                                <a
                                    use:link
                                    href="/edu-student-classrooms"
                                    class="dropdown-item">학생 학습모듈 관리</a
                                >
                            </li>
                            <!-- <li> <a use:link href="/" class="dropdown-item" >학생의 학습모듈 결과 분석</a > </li> -->
                        </ul>
                    </li>
                    <li class="nav-item text-center">
                        <a
                            use:link
                            href="/user-update?teacher"
                            class="nav-link"
                            style="line-height:75%; padding-top:14px;"
                            >나의 정보<br />
                            <span style="font-size:12px; color:dimgray;"
                                >{$userid}</span
                            ></a
                        >
                    </li>
                    <li class="nav-item">
                        <a
                            class="nav-link"
                            use:link
                            href="/"
                            on:click={() => {
                                $access_token = "";
                                $userid = "";
                                $is_student = false;
                                $is_teacher = false;
                                $student_current_classroom = 0;
                            }}>로그아웃</a
                        >
                    </li>
                    <li class="nav-item" style="width:30px;"></li>
                {:else}
                    <li class="nav-item" style="width:30px;"></li>
                    <li class="nav-item">
                        <a class="nav-link" use:link href="/user-create"
                            >회원가입</a
                        >
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" use:link href="/user-login"
                            >로그인</a
                        >
                    </li>
                    <li class="nav-item" style="width:30px;"></li>
                {/if}
            </ul>
        </div>
    </div>
</nav>

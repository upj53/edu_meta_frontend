<script>
    import Router from "svelte-spa-router";
    import Navigation from "./components/Navigation.svelte";
    import Home from "./routes/Home.svelte";
    import UserCreate from "./routes/UserCreate.svelte";
    import UserUpdate from "./routes/UserUpdate.svelte";
    import UserLogin from "./routes/UserLogin.svelte";
    import StudentClassroom from "./routes/StudentClassroom.svelte";
    import StudentClassroomAsync from "./routes/StudentClassroomAsync.svelte";
    import StudentClassroomAsync2 from "./routes/StudentClassroomAsync2.svelte";
    import StudentSetClassroom from "./routes/StudentSetClassroom.svelte";
    import StudentSetTime from "./routes/StudentSetTime.svelte";
    import StudentSetDelayTime from "./routes/StudentSetDelayTime.svelte";
    import StudentClassroomResult from "./routes/StudentClassroomResult.svelte";
    import StudentClassroomSummary from "./routes/StudentClassroomSummary.svelte";
    import StudentClassroomReview from "./routes/StudentClassroomReview.svelte";
    import StudentClassroomPrevious from "./routes/StudentClassroomPrevious.svelte";
    import AddieAnalyzeStudents from "./routes/AddieAnalyzeStudents.svelte";
    import AddieAnalyzeStudentView from "./routes/AddieAnalyzeStudentView.svelte";
    import AddieAnalyzeStudentUpdate from "./routes/AddieAnalyzeStudentUpdate.svelte";
    import AddieDesignSubjects from "./routes/AddieDesignSubjects.svelte";
    import AddieDesignSubjectCreate from "./routes/AddieDesignSubjectCreate.svelte";
    import AddieDesignSubjectView from "./routes/AddieDesignSubjectView.svelte";
    import AddieDesignObjects from "./routes/AddieDesignObjects.svelte";
    import AddieDesignObjectCreate from "./routes/AddieDesignObjectCreate.svelte";
    import AddieDesignObjectView from "./routes/AddieDesignObjectView.svelte";
    import AddieDevelopProblems from "./routes/AddieDevelopProblems.svelte";
    import AddieDevelopProblemCreate from "./routes/AddieDevelopProblemCreate.svelte";
    import AddieDevelopProblemView from "./routes/AddieDevelopProblemView.svelte";
    import AddieDevelopClassrooms from "./routes/AddieDevelopClassrooms.svelte";
    import AddieDevelopClassroomCreate from "./routes/AddieDevelopClassroomCreate.svelte";
    import AddieDevelopClassroomUpdate from "./routes/AddieDevelopClassroomUpdate.svelte";
    import AddieDevelopClassroomView from "./routes/AddieDevelopClassroomView.svelte";
    import AddieDevelopProblemUpdate from "./routes/AddieDevelopProblemUpdate.svelte";
    import EvaluateStudentClassrooms from "./routes/EvaluateStudentClassrooms.svelte";
    import EvaluateStudentClassroomViewScore from "./routes/EvaluateStudentClassroomViewScore.svelte";

    const routes = {
        "/": Home,
        "/user-create": UserCreate,
        "/user-update": UserUpdate,
        "/user-login": UserLogin,
        "/my-classroom": StudentClassroomAsync,
        "/my-module": StudentClassroomAsync2,
        "/set-classroom": StudentSetClassroom,
        "/set-time": StudentSetTime,
        "/set-delaytime": StudentSetDelayTime,
        "/classroom-result": StudentClassroomResult,
        "/classroom-summary": StudentClassroomSummary,
        "/classroom-review": StudentClassroomReview,
        "/previous-classroom": StudentClassroomPrevious,
        "/edu-students": AddieAnalyzeStudents,
        "/edu-student-view/:id": AddieAnalyzeStudentView,
        "/edu-student-update/:id": AddieAnalyzeStudentUpdate,
        "/edu-subjects": AddieDesignSubjects,
        "/edu-subject-create": AddieDesignSubjectCreate,
        "/edu-subject-view/:idx": AddieDesignSubjectView,
        "/edu-objects": AddieDesignObjects,
        "/edu-object-create": AddieDesignObjectCreate,
        "/edu-object-view/:idx": AddieDesignObjectView,
        "/edu-problems": AddieDevelopProblems,
        "/edu-problem-create": AddieDevelopProblemCreate,
        "/edu-problem-view/:idx": AddieDevelopProblemView,
        "/edu-problem-update/:idx": AddieDevelopProblemUpdate,
        "/edu-classrooms": AddieDevelopClassrooms,
        "/edu-classroom-create": AddieDevelopClassroomCreate,
        "/edu-classroom-view/:idx": AddieDevelopClassroomView,
        "/edu-classroom-update/:idx": AddieDevelopClassroomUpdate,
        "/edu-student-classrooms": EvaluateStudentClassrooms,
        "/edu-student-classroom-viewscore/:userid/:classroom_idx": EvaluateStudentClassroomViewScore,
    };
</script>

<Navigation />
<Router {routes} />

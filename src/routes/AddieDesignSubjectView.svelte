<script>
	import { link } from "svelte-spa-router";
	import { marked } from "marked";
	import fastapi from "../lib/api";

	export let params = {};
	let subject_idx = params.idx;
	let subject = {
		subject: "",
		subject_title: "",
		subject_main_idea: "",
		subject_main_1: "",
		subject_main_2: "",
		subject_main_3: "",
		subject_goal: "",
		subject_goal_detail: "",
	};

	function get_subject() {
		fastapi(
			"get",
			`/edu/design/subject/${subject_idx}`,
			{},
			(json) => {
				subject = json;
			},
			(json_error) => {},
		);
	}
	get_subject();
</script>

<div class="container">
	<h5 class="my-3 border-bottom pb-2">교육과정</h5>
	<h6 class="my-3 border-bottom pb-2">제목</h6>
	<h6 class="my-3 pb-2" style="font-weight:bold;">{subject.subject_title}</h6>

	<h6 class="my-3 border-bottom pb-2">핵심 아이디어</h6>
	<h6 class="my-3 pb-2">{@html marked.parse(subject.subject_main_idea)}</h6>

	<h6 class="my-3 border-bottom pb-2">지식 · 이해</h6>
	<h6 class="my-3 pb-2">{@html marked.parse(subject.subject_main_1)}</h6>

	<h6 class="my-3 border-bottom pb-2">과정 · 기능</h6>
	<h6 class="my-3 pb-2">{@html marked.parse(subject.subject_main_2)}</h6>

	<h6 class="my-3 border-bottom pb-2">가치 · 태도</h6>
	<h6 class="my-3 pb-2">{@html marked.parse(subject.subject_main_3)}</h6>

	<h6 class="my-3 border-bottom pb-2">성취 기준</h6>
	<h6 class="my-3 pb-2">{@html marked.parse(subject.subject_goal)}</h6>

	<h6 class="my-3 border-bottom pb-2">성취 기준 상세 설명</h6>
	<h6 class="my-3 pb-2">{@html marked.parse(subject.subject_goal_detail)}</h6>

	<a use:link href="/edu-subjects" class="btn btn-primary my-3"
		>목록</a
	>
</div>

<!--
  <h6 class="my-3 border-bottom pb-2"></h6>
  <h6 class="my-3 pb-2">{@html marked.parse(subject.)}</h6>
  -->

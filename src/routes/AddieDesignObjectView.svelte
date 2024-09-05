<script>
	import { link } from "svelte-spa-router";
	import { marked } from "marked";
	import fastapi from "../lib/api";

	export let params = {};
	let object_idx = params.idx;
	let object = {
		object_title: "",
		object_detail: "",
	};

	function get_subject() {
		fastapi(
			"get",
			`/edu/design/object/${object_idx}`,
			{},
			(json) => {
				object = json;
			},
			(json_error) => {},
		);
	}
	get_subject();
</script>

<div class="container">
	<h5 class="my-3 border-bottom pb-2">수업주제</h5>
	<h6 class="my-3 border-bottom pb-2">제목</h6>
	<h6 class="my-3 pb-2" style="font-weight:bold;">{object.object_title}</h6>

	<h6 class="my-3 border-bottom pb-2">설명</h6>
	<h6 class="my-3 pb-2">{@html marked.parse(object.object_detail)}</h6>

	<a use:link href="/edu-objects" class="btn btn-primary my-3"
		>목록</a
	>
</div>

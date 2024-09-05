<script>
	import { link } from "svelte-spa-router";
	import { marked } from "marked";
	import fastapi from "../lib/api";

	let problem_list = [];
	let checked_list = true;
	let checked_detail = true;
	let checked_chatgpt = true;
	let chatbot_first_msg = `Chatbot의 코멘트가 출력되는 창입니다.\ncode에 대한 코멘트를 보고 싶다면, 코드 제출 후\n피드백 버튼을 눌러주세요.`;
	let problem_ct_1 = false;
	let problem_ct_2 = false;
	let problem_ct_3 = false;
	let problem_ct_4 = false;
	let problem_ct_5 = false;
	let problem_ct_6 = false;
	let problem_ct_7 = false;
	let problem_ct_8 = false;
	let problem_ct_9 = false;

	let problem_idx = 9; //params.idx;

	let problem = {
		idx: 0,
		problem_title: "",
		problem_classify: 0,
		problem_ct_list: [],
		problem_detail: "",
		problem_start_code: "",
		problem_solution_code: "",
	};

	function get_problem_list() {
		let params = {};
		fastapi(
			"get",
			"/edu/develop/problem/list",
			params,
			(json1) => {
				fastapi(
					"get",
					"/edu/design/object/list",
					{},
					(json2) => {
						let object_list = {};
						let obj_list = json2.object_list;
						for (let i = 0; i < obj_list.length; i++) {
							object_list[obj_list[i].idx] = obj_list[i];
						}
						problem_list = json1.problem_list;
						// console.log(JSON.stringify(object_list));
						for (let i = 0; i < problem_list.length; i++) {
							let cls_idx = problem_list[i]["problem_classify"];
							problem_list[i]["problem_classify_str"] =
								object_list[cls_idx]["object_title"];
						}
					},
					(json_error) => {},
				);
			},
			(json_error) => {},
		);
	}

	function get_problem() {
		fastapi(
			"get",
			`/edu/develop/problem/${problem_idx}`,
			{},
			(json) => {
				problem = json;
				// console.log(json);
				problem_ct_1 = problem.problem_ct_list[0];
				problem_ct_2 = problem.problem_ct_list[1];
				problem_ct_3 = problem.problem_ct_list[2];
				problem_ct_4 = problem.problem_ct_list[3];
				problem_ct_5 = problem.problem_ct_list[4];
				problem_ct_6 = problem.problem_ct_list[5];
				problem_ct_7 = problem.problem_ct_list[6];
				problem_ct_8 = problem.problem_ct_list[7];
				problem_ct_9 = problem.problem_ct_list[8];
			},
			(json_error) => {},
		);
	}

	function showhide_list() {
		let obj0 = document.getElementById("layer_editor");
		let obj = document.getElementById("layer_list");
		let obj2 = document.getElementById("layer_detail_list");
		if (checked_list) {
			obj.style.display = "block";
		} else {
			obj.style.display = "none";
		}
		if (!checked_list && !checked_detail) {
			obj2.style.display = "none";
		} else {
			obj2.style.display = "block";
		}
		if (!checked_list && !checked_detail) {
			obj0.classList.remove("col-6");
			obj0.classList.add("col-9");
		} else {
			if (obj0.classList.contains("col-9")) {
				obj0.classList.remove("col-9");
				obj0.classList.add("col-6");
			}
		}
	}
	function showhide_detail() {
		let obj0 = document.getElementById("layer_editor");
		let obj = document.getElementById("layer_detail");
		let obj2 = document.getElementById("layer_detail_list");
		if (checked_detail) {
			obj.style.display = "block";
		} else {
			obj.style.display = "none";
		}
		if (!checked_list && !checked_detail) {
			obj2.style.display = "none";
		} else {
			obj2.style.display = "block";
		}
		if (!checked_list && !checked_detail) {
			obj0.classList.remove("col-6");
			obj0.classList.add("col-9");
		} else {
			if (obj0.classList.contains("col-9")) {
				obj0.classList.remove("col-9");
				obj0.classList.add("col-6");
			}
		}
	}
	function showhide_chatgpt() {
		let obj = document.getElementById("layer_chatgpt");
		if (checked_chatgpt) {
			obj.style.display = "block";
		} else {
			obj.style.display = "none";
		}
	}

	get_problem_list();
	get_problem();
</script>

<svelte:head>
	<script
		src="https://kit.fontawesome.com/eaa55c88d8.js"
		crossorigin="anonymous"
	></script>
</svelte:head>

<div class="container" style="margin:0px; padding:0px;">
	<div class="row col-12" style="width:100vw;height:90vh;">
		<!-- 왼쪽 메뉴: 문제 종류 -->
		<div class="col-3" id="layer_detail_list">
			<div
				style="margin:0 5px 0 5px; padding:10px; background-color:#efefef; border-radius:5px;"
				id="layer_detail"
			>
				{@html marked.parse(problem.problem_detail)}
			</div>
			<div class="accordion" id="layer_list">
				<div class="accordian-item">
					<h2 class="accordion-header">
						<button
							class="accordion-button collapsed"
							type="button"
							data-bs-toggle="collapse"
							data-bs-target="#collapseOne"
							aria-expanded="false"
							aria-controls="collapseOne"
						>
							4. 입출력
						</button>
					</h2>
					<div
						id="collapseOne"
						class="accordion-collapse collapse"
						data-bs-parent="#accordionMenu"
					>
						<div
							class="accordion-body"
							style="margin:0; padding:0;"
						>
							<ul class="list-group">
								<li class="list-group-item">
									나의 이름 출력하기
								</li>
							</ul>
						</div>
					</div>
				</div>
				<div class="accordian-item">
					<h2 class="accordion-header">
						<button
							class="accordion-button collapsed"
							type="button"
							data-bs-toggle="collapse"
							data-bs-target="#collapseTwo"
							aria-expanded="false"
							aria-controls="collapseTwo"
						>
							5. 조건문
						</button>
					</h2>
					<div
						id="collapseTwo"
						class="accordion-collapse collapse"
						data-bs-parent="#accordionMenu"
					>
						<div
							class="accordion-body"
							style="margin:0; padding:0;"
						>
							<ul class="list-group">
								<li class="list-group-item">
									이번달은 봄 여름 가울 겨울?
								</li>
								<li class="list-group-item">
									오전 오후 시간 출력하기
								</li>
							</ul>
						</div>
					</div>
				</div>
				<div class="accordian-item">
					<h2 class="accordion-header">
						<button
							class="accordion-button"
							type="button"
							data-bs-toggle="collapse"
							data-bs-target="#collapseThree"
							aria-expanded="true"
							aria-controls="collapseThree"
						>
							6. 반복문
						</button>
					</h2>
					<div
						id="collapseThree"
						class="accordion-collapse collapse show"
						data-bs-parent="#accordionMenu"
					>
						<div
							class="accordion-body"
							style="margin:0; padding:0;"
						>
							<ul class="list-group">
								<li class="list-group-item">
									자연수 n까지 출력하기
								</li>
								<li class="list-group-item">카운트다운</li>
								<li class="list-group-item">
									자연수 n까지 더하기
								</li>
								<li class="list-group-item">별(*) 그리기 1</li>
								<li class="list-group-item">별(*) 그리기 2</li>
								<li class="list-group-item active">
									짝수의 합 구하기
								</li>
								<li class="list-group-item">구구단 출력하기</li>
							</ul>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- 가운데: 코드작성 -->
		<div class="col-6" style="margin:0; padding:0;" id="layer_editor">
			<h5 id="iframe-title" class="text-center fw-bold">
				{problem.problem_title}
			</h5>
			<div class="d-flex justify-content-evenly">
				<div class="form-check form-switch">
					<input
						class="form-check-input"
						type="checkbox"
						role="switch"
						id="checkbox_list"
						bind:checked={checked_list}
						on:change={showhide_list}
					/>
					<label class="form-check-label" for="checkbox_list"
						>리스트 보기</label
					>
				</div>
				<div class="form-check form-switch">
					<input
						class="form-check-input"
						type="checkbox"
						role="switch"
						id="checkbox_detail"
						bind:checked={checked_detail}
						on:change={showhide_detail}
					/>
					<label class="form-check-label" for="checkbox_detail"
						>문제설명 보기</label
					>
				</div>
				<div class="form-check form-switch">
					<input
						class="form-check-input"
						type="checkbox"
						role="switch"
						id="checkbox_chatgpt"
						bind:checked={checked_chatgpt}
						on:change={showhide_chatgpt}
					/>
					<label class="form-check-label" for="checkbox_chatgpt"
						>챗봇 보기</label
					>
				</div>
			</div>
			<iframe
				id="iframe-python-editor"
				title="Python Editor"
				width="100%"
				height="600px"
				style="margin:0px; padding:0px;"
				src="https://upj53.run.goorm.io/edu/editor"
				frameborder="0"
			></iframe>
			<div class="text-end">
				<div
					id="loading-feedback"
					class="spinner-border text-success pt-3"
					role="status"
					style="display:none;"
				>
					<span class="visually-hidden">Loading...</span>
				</div>
				<button id="btn_feedback" class="btn btn-success"
					>피드백 받기</button
				>
				<!-- onclick="sendFeedback()" -->
			</div>
		</div>

		<!-- 오른쪽: ChatGPT -->
		<div class="col-3" style="margin:0px; padding:10px;" id="layer_chatgpt">
			<h6 id="iframe-title" class="text-center">
				<!-- <img src="/assets/chatgpt-logo.png" alt="" style="height:15px; width:auto;"> -->
				Chatbot 코멘트
			</h6>

			<div id="chat_result">
				<div class="chat">
					<div class="chatgpt-left-dialog">{chatbot_first_msg}</div>
				</div>
			</div>

			<div class="input-group pt-1">
				<textarea
					id="chat_dialog"
					class="form-control"
					style="background-color:aliceblue;"
				></textarea>
				<button
					id="btn_send"
					class="btn btn-primary"
					style="width:50px;"
				>
					<!-- onclick="sendDialog()" -->
					<span id="label-dialog"
						><i class="fa-regular fa-paper-plane"></i></span
					>
					<div
						id="loading-dialog"
						class="spinner-border text-light pt-3"
						role="status"
						style="display:none;"
					>
						<span class="visually-hidden">Loading...</span>
					</div>
				</button>
			</div>
		</div>
	</div>
</div>

<style>
	#chat_result {
		height: 550px;
		background-color: white;
		border: 1px solid #aaa;
		border-radius: 5px;
		margin: 0;
		padding: 10px;
		overflow-y: auto;
	}
	.chat {
		margin: 5px 0 5px 0;
	}
	/* .chat-right {
    text-align: end;
  } */
	.chatgpt-left-dialog {
		display: inline-block;
		font-size: 12px;
		background-color: aquamarine;
		border-radius: 5px;
		padding: 9px;
		white-space: pre-wrap;
	}
	/* .chat-right-dialog {
    display: inline-block;
    font-size: 12px;
    background-color: yellow;
    border-radius: 5px;
    padding: 9px;
    white-space: pre-line;
  } */
	#chat_dialog {
		font-size: 12px;
	}
</style>

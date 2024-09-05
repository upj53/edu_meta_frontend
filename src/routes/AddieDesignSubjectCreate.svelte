<script>
	import Error from "../components/Error.svelte";

	let error = { detail: [] };
	let subject_title = "";
	let subject_main_idea = "";
	let subject_main_1 = "";
	let subject_main_2 = "";
	let subject_main_3 = "";
	let subject_goal = "";
	let subject_goal_detail = "";
</script>

<div class="container">
	<h5 class="my-3 border-bottom pb-2">교육과정 생성</h5>
	<Error {error} />
	<form method="post">
		<!---------------기본 정보----------------->
		<h6 class="my-3 border-bottom pb-2">기본 정보</h6>
		<div class="mb-3">
			<label for="subject_title">제목</label>
			<input
				placeholder="교수설계의 제목을 입력해주세요."
				type="text"
				class="form-control"
				id="subject_title"
				bind:value={subject_title}
			/>
		</div>
		<pre>
수업 기간
수업 장소
수업 대상
수업 난이도
교수자
    </pre>
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
		<!---------------내용 체계----------------->
		<h6 class="my-3 border-bottom pb-2">내용 체계</h6>
		<div class="mb-3">
			<label for="subject_main_idea">핵심 아이디어</label>
			<textarea
				placeholder="교수 설계에 대한 핵심 아이디어를 입력해주세요."
				class="form-control"
				id="subject_main_idea"
				bind:value={subject_main_idea}
				rows="3"
			></textarea>
		</div>
		<div class="mb-3">
			<label for="subject_main_1">지식 · 이해</label>
			<textarea
				placeholder="지식과 이해에 대한 내용을 입력해주세요."
				class="form-control"
				rows="5"
				id="subject_main_1"
				bind:value={subject_main_1}
			></textarea>
		</div>
		<div class="mb-3">
			<label for="subject_main_2">과정 · 기능</label>
			<textarea
				placeholder="과정과 기능에 대한 내용을 입력해주세요."
				class="form-control"
				rows="5"
				id="subject_main_2"
				bind:value={subject_main_2}
			></textarea>
		</div>
		<div class="mb-3">
			<label for="subject_main_3">가치 · 태도</label>
			<textarea
				placeholder="가치와 태도에 대한 내용을 입력해주세요."
				class="form-control"
				rows="5"
				id="subject_main_3"
				bind:value={subject_main_3}
			></textarea>
		</div>

		<!---------------성취 기준----------------->
		<h6 class="my-3 border-bottom pb-2">성취 기준</h6>
		<div class="mb-3">
			<label for="subject_goal">성취 기준</label>
			<textarea
				placeholder="성취 기준을 입력해주세요."
				class="form-control"
				rows="5"
				id="subject_goal"
				bind:value={subject_goal}
			></textarea>
		</div>
		<div class="mb-3">
			<label for="subject_goal_detail">상세 설명</label>
			<textarea
				placeholder="성취 기준에 대한 상세 설명을 입력해주세요."
				class="form-control"
				rows="5"
				id="subject_goal_detail"
				bind:value={subject_goal_detail}
			></textarea>
		</div>
		<div class="mb-3">
			<div class="row justify-content-evenly">
				<button class="col-3 btn btn-outline-primary">임시저장</button>
				<button class="col-3 btn btn-primary">저장하기</button>
			</div>
		</div>
	</form>
</div>

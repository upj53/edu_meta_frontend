<script>
	import Error from "../components/Error.svelte";

	let error = { detail: [] };
	let object_title = "";
	let object_detail = "";
</script>

<div class="container">
	<h5 class="my-3 border-bottom pb-2">수업주제 생성</h5>
	<Error {error} />
	<form method="post">
		<div class="mb-3">
			<label for="object_title">제목</label>
			<input
				placeholder="수업주제의 제목을 입력해주세요."
				type="text"
				class="form-control"
				id="object_title"
				bind:value={object_title}
			/>
		</div>
		<div class="mb-3">
			<label for="object_detail">상세 설명</label>
			<textarea
				placeholder="수업주제에 대한 상세 설명을 입력해주세요."
				class="form-control"
				rows="3"
				id="object_detail"
				bind:value={object_detail}
			></textarea>
		</div>
		<div class="mb-3">
			<div class="row justify-content-evenly">
				<button class="col-3 btn btn-primary" style="width:300px;"
					>저장 후 다른 주제 계속 입력하기</button
				>
				<button class="col-3 btn btn-outline-primary">저장하기</button>
			</div>
		</div>
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
	</form>
</div>

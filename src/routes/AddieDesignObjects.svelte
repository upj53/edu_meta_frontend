<script>
    import { link } from "svelte-spa-router";
    import fastapi from "../lib/api";

    let object_list = [];

    function get_object_list() {
        let params = {};
        fastapi(
            "get",
            "/edu/design/object/list",
            params,
            (json1) => {
                fastapi(
                    "get",
                    "/edu/design/subject/list",
                    {},
                    (json2) => {
                        let subject_list = {};
                        let sub_list = json2.subject_list;
                        for (let i = 0; i < sub_list.length; i++) {
                            subject_list[sub_list[i].idx] = sub_list[i];
                        }
                        // console.log(JSON.stringify(subject_list));
                        object_list = json1.object_list;
                        for (let i = 0; i < object_list.length; i++) {
                            let sub_idx = object_list[i]["subject_idx"];
                            object_list[i]["subject_idx_str"] =
                                subject_list[sub_idx]["subject_title"];
                        }
                    },
                    (json2_error) => {},
                );
            },
            (json1_error) => {},
        );
    }
    get_object_list();
</script>

<div class="container">
    <h5 class="my-3 border-bottom pb-2">수업주제 목록</h5>
    <table class="table">
        <thead>
            <tr class="text-center table-dark">
                <th>순번</th>
                <th>교육과정</th>
                <th>제목</th>
                <th style="width:200px;">&nbsp;</th>
            </tr>
        </thead>
        <tbody>
            {#each object_list as object, i}
                <tr class="text-center">
                    <td>{object.idx}</td>
                    <td><span style="color:grey; font-size:12px;">{object.subject_idx_str}</span></td>
                    <td><span style="font-weight:bold;">{object.object_title}</span></td>
                    <td>
                        <a
                            use:link
                            href="/edu-object-view/{object.idx}"
                            class="btn btn-sm btn-outline-secondary">보기</a
                        >
                        <a
                            href={null}
                            class="btn btn-sm btn-outline-primary"
                            on:click={() => {
                                alert("현재 비활성 상태입니다.");
                                return false;
                            }}>수정</a
                        >
                        <a
                            href={null}
                            class="btn btn-sm btn-outline-danger"
                            on:click={() => {
                                alert("현재 비활성 상태입니다.");
                                return false;
                            }}>삭제</a
                        >
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
</div>

import{c as e}from"./chunk-9a18e39e.js";import{N as r}from"./index-12c0d33b.js";const t=async()=>(await r.getAll()).data.data,a=()=>{const{data:r=[],isLoading:a,error:o,refetch:s}=e({queryKey:["projects"],queryFn:t,staleTime:3e5,gcTime:6e5});return{projects:r,loading:a,error:o?"프로젝트를 불러오는데 실패했습니다.":null,refetch:s}};export{a as u};
//# sourceMappingURL=chunk-7440fae0.js.map

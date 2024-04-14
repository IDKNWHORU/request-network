This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
pnpm i

pnpm dev
```

## Lifecycle of Request

![](https://docs.request.network/~gitbook/image?url=https:%2F%2F1914277788-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252Fei6UAiSK3iAAi0mFH667%252Fuploads%252FsISppzxBCOUF7N2k5TM8%252FLifecycle%2520of%2520a%2520Request.jpg%3Falt=media%26token=4975c5ba-d388-4a62-8360-de24a75b71a4&width=768&dpr=4&quality=100&sign=870b543a333aa9571b8894f8786e3eb85de69c2b3cdbf646ad8974c06329cbb3)

1. 돈 요청 만들기(`Create a request`)

   - 주인공: 영희가(`0x1B...e81d`) 돈을 받는 사람이고(`payee`), 철수가(`0xE9...B0aA`) 돈을 주는 사람이에요(`payer`).
   - 이야기: 영희가 "철수야, 나에게 돈 좀 줘"라고 요청을 만들어요. 이 요청에는 받을 사람, 줄 사람, 얼마를 줄지, 어떤 돈으로 줄지, 그리고 다른 중요한 내용이 적혀 있어요.
   - 비밀: 영희는 이 요청을 비밀로 하고 싶어서, 특별한 방법으로 정보를 숨겨요. 이제 이 비밀은 철수와 영희, 그리고 도와줄 다른 친구들만 알 수 있어요.
   - 요청 저장: 영희는 이 요청을 컴퓨터 세계의 특별한 보관함(IPFS)에 넣어요. 이 보관함은 누구나 볼 수 있지만, 누가 무엇을 보관했는지는 몰라요.
   - 요청 기록: 영희의 요청은 또 다른 컴퓨터 세계(지노시스 체인)에 기록돼요. 이 기록은 철수가 어디에서든 돈을 줄 수 있게 해줘요, 지노시스 체인뿐만 아니라 다른 많은 곳에서도 돈을 줄 수 있어요.

2. 돈 요청 바꾸기(`Approve`)

   - 가능성: 영희는 요청을 취소하거나 돈의 양을 바꿀 수 있어요. 철수는 이 요청을 받아들여서 "영희야, 돈 줄게"라고 말할 수 있어요.
   - 친구 추가: 만약 영희가 정보를 비밀로 했다면, 영희와 철수는 친구 훈이를 포함시켜서 훈이도 요청을 볼 수 있게 할 수 있어요.

3. 돈 주기(`Pay a request`)

   - 시작하기: 철수는 영희의 요청에서 특별한 숫자(참조번호)를 사용해서 돈을 보내기 시작해요.
     기록하기: 철수는 컴퓨터 세계의 특별한 장소(스마트 계약)를 통해 영희에게 돈을 보내고, 이 돈 보내기가 잘 되었다는 기록을 남겨요.
   - 기록 유형:
     참조 기반: 주로 사용하는 방법으로, 철수가 돈을 보낼 때 참조번호만 기록돼요.
   - 선언적 요청: 철수가 "돈 보냈어"라고 하고, 영희가 "돈 받았어"라고 할 때, 그 정보가 다시 컴퓨터 세계의 보관함(IPFS)에 적혀요.

4. 돈 요청 찾기 / 돈 지불 확인하기(`Retrieve a user's requests`)

   - 추적하기: 철수가 돈을 보낼 때 그 사실이 특별한 추적 시스템(서브그래프)에 기록돼요.
   - 정보 가져오기: 영희는 보관함에서 요청 내용을 가져와서 지금까지 얼마의 돈이 모였는지 확인할 수 있어요.

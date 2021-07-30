import { AppError } from '../errors/app-error';
import aligoapi from 'aligoapi';
import dotenv from 'dotenv';
// import { Request, Response, NextFunction } from 'express';
dotenv.config({ path: './config.env' });

let AuthData = {
  apikey: process.env.ALIGO_API_KEY,
  userid: 'futureconnect',
  token: '',
};
// token을 제외한 인증용 데이터는 모든 API 호출시 필수값입니다.
// token은 토큰생성을 제외한 모든 API 호출시 필수값입니다.
// @ts-ignore
const sendAlimtalk = async (req, res) => {
  // 알림톡 전송
  console.log('get Auth');
  req.body = {
    type: 'm',
    time: 1,
  };
  console.log('before token');
  let data = await aligoapi.token(req, AuthData);
  console.log('after token');
  if (data.code != 0) throw new AppError('Fail to get Token from Aligo', 400);
  AuthData.token = data.token;
  console.log(AuthData.token);
  let body;
  console.log('is called?');
  if (req.iamportData.customData.option && req.iamportData.customData.option == 'takeOut') {
    body = {
      senderkey: process.env.ALIGO_SENDER_KEY,
      tpl_code: 'TE_9735',
      sender: process.env.SENDER_PHONE_NUMBER,
      receiver_1: req.iamportData.buyer_tel,
      subject_1: '주문알림',
      message_1: `[LivFarm] 주문완료안내
      안녕하세요, ${req.iamportData.buyer_name}님. 리브팜에서 주문해주셔서 감사합니다. 예정시간에 맞춰 정성스럽게 준비해 두겠습니다.
      □ 주문명 : ${req.iamportData.name}
      □ 매장주소 : ${req.iamportData.customData.storeAddress}
      □ 방문예정시각 : ${req.iamportData.customData.bookingOrderMessage}
      □ 결제금액 : ${req.iamportData.amount}원`,
      recvname: '리브팜',
      receiver_2: process.env.ADMIN_PHONE_NUMBER,
      subject_2: '주문알림',
      message_2: `[LivFarm] 주문완료안내
      안녕하세요, ${req.iamportData.buyer_name}님. 리브팜에서 주문해주셔서 감사합니다. 예정시간에 맞춰 정성스럽게 준비해 두겠습니다.
      □ 주문명 : ${req.iamportData.name}
      □ 매장주소 : ${req.iamportData.customData.storeAddress}
      □ 방문예정시각 : ${req.iamportData.customData.bookingOrderMessage}
      □ 결제금액 : ${req.iamportData.amount}원`,
      //@ts-ignore

      recvname: '리브팜',
      receiver_3: process.env.ADMIN2_PHONE_NUMBER,
      subject_3: '주문알림',
      message_3: `[LivFarm] 주문완료안내
      안녕하세요, ${req.iamportData.buyer_name}님. 리브팜에서 주문해주셔서 감사합니다. 예정시간에 맞춰 정성스럽게 준비해 두겠습니다.
      □ 주문명 : ${req.iamportData.name}
      □ 매장주소 : ${req.iamportData.customData.storeAddress}
      □ 방문예정시각 : ${req.iamportData.customData.bookingOrderMessage}
      □ 결제금액 : ${req.iamportData.amount}원`,
      //@ts-ignore

      recvname: '리브팜',
      failover: 'Y', // Y or N
      fsubject_1: '주문알림문자',
      fmessage_1: `[LivFarm] 주문완료안내
      안녕하세요, ${req.iamportData.buyer_name}님. 리브팜에서 주문해주셔서 감사합니다. 예정시간에 맞춰 정성스럽게 준비해 두겠습니다.
      □ 주문명 : ${req.iamportData.name}
      □ 매장주소 : ${req.iamportData.customData.storeAddress}
      □ 방문예정시각 : ${req.iamportData.customData.bookingOrderMessage}
      □ 결제금액 : ${req.iamportData.amount}원`,
      fsubject_2: '주문알림문자',
      fmessage_2: `[LivFarm] 주문완료안내
      안녕하세요, ${req.iamportData.buyer_name}님. 리브팜에서 주문해주셔서 감사합니다. 예정시간에 맞춰 정성스럽게 준비해 두겠습니다.
      □ 주문명 : ${req.iamportData.name}
      □ 매장주소 : ${req.iamportData.customData.storeAddress}
      □ 방문예정시각 : ${req.iamportData.customData.bookingOrderMessage}
      □ 결제금액 : ${req.iamportData.amount}원`,
      fsubject_3: '주문알림문자',
      fmessage_3: `[LivFarm] 주문완료안내
      안녕하세요, ${req.iamportData.buyer_name}님. 리브팜에서 주문해주셔서 감사합니다. 예정시간에 맞춰 정성스럽게 준비해 두겠습니다.
      □ 주문명 : ${req.iamportData.name}
      □ 매장주소 : ${req.iamportData.customData.storeAddress}
      □ 방문예정시각 : ${req.iamportData.customData.bookingOrderMessage}
      □ 결제금액 : ${req.iamportData.amount}원`,
    };
  } else if (req.iamportData.customData.option && req.iamportData.customData.option == 'inStore') {
    body = {
      senderkey: process.env.ALIGO_SENDER_KEY,
      tpl_code: 'TE_2986',
      sender: process.env.SENDER_PHONE_NUMBER,
      receiver_1: process.env.ADMIN_PHONE_NUMBER,
      subject_1: '주문알림',
      message_1: `[LivFarm] 주문완료안내
      안녕하세요, ${req.iamportData.buyer_name}님. 리브팜에서 주문해주셔서 감사합니다. 배송 예정시간에 맞게 갓 수확한 채소를 신선하게 보내드리겠습니다.
      □ 주문명 : ${req.iamportData.name}
      □ 배송지 : 매장 안 QR 결제
      □ 배송예정일 : 매장 안 QR 결제
      □ 결제금액 : ${req.iamportData.amount}원`,
      recvname: '리브팜',
      receiver_2: process.env.ADMIN2_PHONE_NUMBER,
      subject_2: '주문알림',
      message_2: `[LivFarm] 주문완료안내
      안녕하세요, ${req.iamportData.buyer_name}님. 리브팜에서 주문해주셔서 감사합니다. 배송 예정시간에 맞게 갓 수확한 채소를 신선하게 보내드리겠습니다.
      □ 주문명 : ${req.iamportData.name}
      □ 배송지 : 매장 안 QR 결제
      □ 배송예정일 : 매장 안 QR 결제
      □ 결제금액 : ${req.iamportData.amount}원`,
      //@ts-ignore
      recvname: '리브팜',
      // button: 버튼 정보 // JSON string,
      failover: 'Y', // Y or N
      fsubject_1: '주문알림문자',
      fmessage_1: `[LivFarm] 주문완료안내
      안녕하세요, ${req.iamportData.buyer_name}님. 리브팜에서 주문해주셔서 감사합니다. 배송 예정시간에 맞게 갓 수확한 채소를 신선하게 보내드리겠습니다.
      □ 주문명 : ${req.iamportData.name}
      □ 배송지 : 매장 안 QR 결제
      □ 배송예정일 : 매장 안 QR 결제
      □ 결제금액 : ${req.iamportData.amount}원`,
      fsubject_2: '주문알림문자',
      fmessage_2: `[LivFarm] 주문완료안내
      안녕하세요, ${req.iamportData.buyer_name}님. 리브팜에서 주문해주셔서 감사합니다. 배송 예정시간에 맞게 갓 수확한 채소를 신선하게 보내드리겠습니다.
      □ 주문명 : ${req.iamportData.name}
      □ 배송지 : 매장 안 QR 결제
      □ 배송예정일 : 매장 안 QR 결제
      □ 결제금액 : ${req.iamportData.amount}원`,
    };
  } else {
    body = {
      senderkey: process.env.ALIGO_SENDER_KEY,
      tpl_code: 'TE_2986',
      sender: process.env.SENDER_PHONE_NUMBER,
      receiver_1: req.iamportData.buyer_tel,
      subject_1: '주문알림',
      message_1: `[LivFarm] 주문완료안내
      안녕하세요, ${req.iamportData.buyer_name}님. 리브팜에서 주문해주셔서 감사합니다. 배송 예정시간에 맞게 갓 수확한 채소를 신선하게 보내드리겠습니다.
      □ 주문명 : ${req.iamportData.name}
      □ 배송지 : ${req.iamportData.buyer_addr}
      □ 배송예정일 : ${req.iamportData.customData.bookingOrderMessage}
      □ 결제금액 : ${req.iamportData.amount}원`,
      recvname: '리브팜',
      receiver_2: process.env.ADMIN_PHONE_NUMBER,
      subject_2: '주문알림',
      message_2: `[LivFarm] 주문완료안내
      안녕하세요, ${req.iamportData.buyer_name}님. 리브팜에서 주문해주셔서 감사합니다. 배송 예정시간에 맞게 갓 수확한 채소를 신선하게 보내드리겠습니다.
      □ 주문명 : ${req.iamportData.name}
      □ 배송지 : ${req.iamportData.buyer_addr}
      □ 배송예정일 : ${req.iamportData.customData.bookingOrderMessage}
      □ 결제금액 : ${req.iamportData.amount}원`,
      //@ts-ignore

      recvname: '리브팜',
      receiver_3: process.env.ADMIN2_PHONE_NUMBER,

      subject_3: '주문알림',
      message_3: `[LivFarm] 주문완료안내
      안녕하세요, ${req.iamportData.buyer_name}님. 리브팜에서 주문해주셔서 감사합니다. 배송 예정시간에 맞게 갓 수확한 채소를 신선하게 보내드리겠습니다.
      □ 주문명 : ${req.iamportData.name}
      □ 배송지 : ${req.iamportData.buyer_addr}
      □ 배송예정일 : ${req.iamportData.customData.bookingOrderMessage}
      □ 결제금액 : ${req.iamportData.amount}원`,
      //@ts-ignore
      recvname: '리브팜',
      // button: 버튼 정보 // JSON string,
      failover: 'Y', // Y or N
      fsubject_1: '주문알림문자',
      fmessage_1: `[LivFarm] 주문완료안내
      안녕하세요, ${req.iamportData.buyer_name}님. 리브팜에서 주문해주셔서 감사합니다. 배송 예정시간에 맞게 갓 수확한 채소를 신선하게 보내드리겠습니다.
      □ 주문명 : ${req.iamportData.name}
      □ 배송지 : ${req.iamportData.buyer_addr}
      □ 배송예정일 : ${req.iamportData.customData.bookingOrderMessage}
      □ 결제금액 : ${req.iamportData.amount}원`,
      fsubject_2: '주문알림문자',
      fmessage_2: `[LivFarm] 주문완료안내
      안녕하세요, ${req.iamportData.buyer_name}님. 리브팜에서 주문해주셔서 감사합니다. 배송 예정시간에 맞게 갓 수확한 채소를 신선하게 보내드리겠습니다.
      □ 주문명 : ${req.iamportData.name}
      □ 배송지 : ${req.iamportData.buyer_addr}
      □ 배송예정일 : ${req.iamportData.customData.bookingOrderMessage}
      □ 결제금액 : ${req.iamportData.amount}원`,
      fsubject_3: '주문알림문자',
      fmessage_3: `[LivFarm] 주문완료안내
      안녕하세요, ${req.iamportData.buyer_name}님. 리브팜에서 주문해주셔서 감사합니다. 배송 예정시간에 맞게 갓 수확한 채소를 신선하게 보내드리겠습니다.
      □ 주문명 : ${req.iamportData.name}
      □ 배송지 : ${req.iamportData.buyer_addr}
      □ 배송예정일 : ${req.iamportData.customData.bookingOrderMessage}
      □ 결제금액 : ${req.iamportData.amount}원`,
    };
  }

  req.body = body;

  // req.body 요청값 예시입니다.
  // _로 넘버링된 최대 500개의 receiver, subject, message, button, fsubject, fmessage 값을 보내실 수 있습니다
  // failover값이 Y일때 fsubject와 fmessage값은 필수입니다.
  console.log(req.body);
  aligoapi
    .alimtalkSend(req, AuthData)
    //@ts-ignore
    .then((r) => {
      console.log(r);
      res.send(r);
    })
    //@ts-ignore
    .catch((e) => {
      console.log(e);
      res.send(e);
    });
};

export { sendAlimtalk };

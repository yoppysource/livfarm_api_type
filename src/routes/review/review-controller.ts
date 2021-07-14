import { NextFunction, Response, Request } from 'express';
import { Review } from '../../models/review';

const reportReview = async (req: Request, res: Response, next: NextFunction) => {
  const reviewId = req.params.reviewId;
  const review = await Review.findById(reviewId);
  if (!review) return next('존재하지 않는 리뷰 입니다');
  if (review?.userIdsWhoReport.includes(req.user.id)) return next('이미 신고하신 리뷰입니다');
  review.userIdsWhoReport.push(req.user.id);
  await review.save();
  res.status(200).json({ status: 'success', data: { data: review } });
};

export { reportReview };

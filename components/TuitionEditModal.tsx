import React, { useState, useEffect, useMemo } from 'react';
import Card from './ui/Card';
import type { Tuition } from '../types';

interface TuitionEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedTuition: Tuition) => void;
  tuition: Tuition | null;
  studentName: string;
}

const TuitionEditModal: React.FC<TuitionEditModalProps> = ({ isOpen, onClose, onSave, tuition, studentName }) => {
  const [otherDiscount, setOtherDiscount] = useState(0);
  const [notes, setNotes] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'결제완료' | '미결제'>('미결제');

  useEffect(() => {
    if (tuition) {
      setOtherDiscount(tuition.otherDiscount);
      setNotes(tuition.notes);
      setPaymentStatus(tuition.paymentStatus);
    }
  }, [tuition]);
  
  const finalFee = useMemo(() => {
    if (!tuition) return 0;
    return (tuition.perSessionFee * tuition.scheduledSessions) - tuition.siblingDiscountAmount + otherDiscount;
  }, [tuition, otherDiscount]);

  if (!isOpen || !tuition) return null;

  const handleSave = () => {
    onSave({
      ...tuition,
      otherDiscount,
      notes,
      paymentStatus,
      finalFee: Math.round(finalFee),
    });
  };
  
  const InfoRow: React.FC<{ label: string; value: string | number; isBold?: boolean }> = ({ label, value, isBold }) => (
    <div className="flex justify-between items-center py-1">
        <span className="text-sm font-medium text-gray-400">{label}</span>
        <span className={`text-base ${isBold ? 'font-bold text-white' : 'text-gray-200'}`}>{value}</span>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose} role="dialog" aria-modal="true">
      <div className="w-full max-w-md" onClick={e => e.stopPropagation()}>
        <Card title={`${studentName} - ${tuition.month} 수강료 조정`}>
          <div className="space-y-4">
            <div className="p-3 bg-gray-800/50 rounded-lg space-y-2">
                <InfoRow label="기본 수강료" value={`${tuition.baseFee.toLocaleString()}원`} />
                <InfoRow label="1회 금액" value={`${tuition.perSessionFee.toLocaleString()}원`} />
                <InfoRow label="예정 횟수" value={`${tuition.scheduledSessions}회`} />
                <InfoRow label="형제 할인" value={`- ${tuition.siblingDiscountAmount.toLocaleString()}원 (${tuition.siblingDiscountRate * 100}%)`} />
            </div>

            <div>
              <label htmlFor="otherDiscount" className="block text-sm font-medium text-gray-300 mb-1">
                기타 할인/할증 (금액)
              </label>
              <input
                id="otherDiscount"
                type="number"
                step="1000"
                value={otherDiscount}
                onChange={e => setOtherDiscount(parseInt(e.target.value, 10) || 0)}
                className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white focus:ring-[#E5A823] focus:border-[#E5A823]"
              />
            </div>
            
             <div className="p-3 bg-gray-900/50 rounded-lg">
                <InfoRow label="최종 청구액" value={`${Math.round(finalFee).toLocaleString()}원`} isBold={true} />
             </div>

             <div>
                <label htmlFor="paymentStatus" className="block text-sm font-medium text-gray-300 mb-1">결제 상태</label>
                <select
                    id="paymentStatus"
                    value={paymentStatus}
                    onChange={e => setPaymentStatus(e.target.value as '결제완료' | '미결제')}
                    className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white focus:ring-[#E5A823] focus:border-[#E5A823]"
                >
                    <option value="미결제">미결제</option>
                    <option value="결제완료">결제완료</option>
                </select>
            </div>
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-300 mb-1">비고</label>
              <textarea
                id="notes"
                rows={3}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white focus:ring-[#E5A823] focus:border-[#E5A823]"
              ></textarea>
            </div>
          </div>
          <div className="mt-8 flex justify-end space-x-4">
            <button type="button" onClick={onClose} className="py-2 px-4 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors text-white font-medium">
              취소
            </button>
            <button type="button" onClick={handleSave} className="py-2 px-4 rounded-lg bg-[#E5A823] hover:bg-yellow-400 transition-colors text-gray-900 font-bold">
              저장
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TuitionEditModal;
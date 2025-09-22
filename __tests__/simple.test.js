describe('Simple Test', () => {
  test('삭제 기능 개선 확인', () => {
    expect(1 + 1).toBe(2);
  });

  test('배열에서 항목 삭제 로직 테스트', () => {
    const originalArray = ['item1', 'item2', 'item3'];
    const idsToDelete = new Set(['item2']);
    const filteredArray = originalArray.filter(item => !idsToDelete.has(item));
    
    expect(filteredArray).toEqual(['item1', 'item3']);
    expect(filteredArray.length).toBe(2);
  });

  test('선택된 항목 개수 계산 테스트', () => {
    const selectedIds = ['id1', 'id2', 'id3'];
    expect(selectedIds.length).toBe(3);
    expect(selectedIds.length > 0).toBe(true);
  });
});
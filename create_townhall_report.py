#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
타운홀 미팅 결과보고서 HWPX 양식 생성 스크립트
지역사회보장협의체 동별 복지문제 발굴 및 해결방안 토론 결과 취합용
"""

import win32com.client as win32
import os
import sys

OUTPUT_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "타운홀미팅_결과보고서_양식.hwpx")

# AlignType 상수: 0=양쪽, 1=왼쪽, 2=오른쪽, 3=가운데
ALIGN_JUSTIFY = 0
ALIGN_LEFT = 1
ALIGN_RIGHT = 2
ALIGN_CENTER = 3


def set_char_shape(hwp, bold=False, size_pt=10):
    """글자 모양 설정 (크기 단위: pt → HWP 단위는 pt*100)"""
    pset = hwp.HParameterSet.HCharShape
    hwp.HAction.GetDefault("CharShape", pset.HSet)
    pset.Height = size_pt * 100
    pset.Bold = 1 if bold else 0
    hwp.HAction.Execute("CharShape", pset.HSet)


def set_para_shape(hwp, align=ALIGN_LEFT, line_spacing=160, prev_spacing=0, next_spacing=0):
    """문단 모양 설정"""
    pset = hwp.HParameterSet.HParaShape
    hwp.HAction.GetDefault("ParaShape", pset.HSet)
    pset.AlignType = align
    pset.LineSpacing = line_spacing
    pset.PrevSpacing = prev_spacing
    pset.NextSpacing = next_spacing
    hwp.HAction.Execute("ParaShape", pset.HSet)


def insert_text(hwp, text):
    """텍스트 삽입"""
    pset = hwp.HParameterSet.HInsertText
    hwp.HAction.GetDefault("InsertText", pset.HSet)
    pset.Text = text
    hwp.HAction.Execute("InsertText", pset.HSet)


def new_line(hwp):
    """새 문단"""
    hwp.HAction.Run("BreakPara")


def blank_line(hwp, count=1):
    """빈 줄 삽입"""
    set_char_shape(hwp, bold=False, size_pt=6)
    for _ in range(count):
        hwp.HAction.Run("BreakPara")
    set_char_shape(hwp, bold=False, size_pt=10)


def insert_heading(hwp, text, level=1):
    """제목 삽입 (level 1/2/3)"""
    size = {1: 15, 2: 12, 3: 10}.get(level, 10)
    prev = {1: 300, 2: 200, 3: 100}.get(level, 50)
    next_sp = {1: 100, 2: 80, 3: 50}.get(level, 40)

    set_para_shape(hwp, align=ALIGN_LEFT, prev_spacing=prev, next_spacing=next_sp)
    set_char_shape(hwp, bold=True, size_pt=size)
    insert_text(hwp, text)
    new_line(hwp)
    # 이후 기본 스타일 복원
    set_para_shape(hwp, align=ALIGN_LEFT, prev_spacing=0, next_spacing=0)
    set_char_shape(hwp, bold=False, size_pt=10)


def insert_label_value(hwp, label, value=""):
    """  ○ 라벨: 값  형식 줄 삽입"""
    set_char_shape(hwp, bold=True, size_pt=10)
    insert_text(hwp, label + ": ")
    set_char_shape(hwp, bold=False, size_pt=10)
    insert_text(hwp, value if value else "                               ")
    new_line(hwp)


def create_table_and_fill(hwp, headers, rows_data, col_widths_mm):
    """표 생성 후 셀 순서대로 채우기"""
    total_rows = 1 + len(rows_data)
    cols = len(headers)

    # 표 생성
    pset = hwp.HParameterSet.HTableCreation
    hwp.HAction.GetDefault("TableCreate", pset.HSet)
    pset.Rows = total_rows
    pset.Cols = cols
    pset.WidthType = 0   # 단에 맞춤
    pset.WidthValue = 0
    pset.HeightType = 0  # 자동
    pset.HeightValue = 0

    # 열 너비 설정
    pset.CreateItemArray("ColWidth", cols)
    for i, w in enumerate(col_widths_mm):
        pset.ColWidth.SetItem(i, int(w * 100))  # mm * 100 = HWP 단위

    hwp.HAction.Execute("TableCreate", pset.HSet)

    # 표 생성 후 커서는 첫 번째 셀(0,0)에 위치
    # 헤더 채우기
    for j, h in enumerate(headers):
        set_para_shape(hwp, align=ALIGN_CENTER)
        set_char_shape(hwp, bold=True, size_pt=9)
        insert_text(hwp, h)
        if j < cols - 1:
            hwp.HAction.Run("TableRightCell")

    # 데이터 행 채우기
    for i, row in enumerate(rows_data):
        hwp.HAction.Run("TableRightCell")  # 다음 셀 (행 끝이면 다음 행 첫 셀로)
        for j, cell in enumerate(row):
            align = ALIGN_CENTER if j == 0 else ALIGN_LEFT
            set_para_shape(hwp, align=align)
            set_char_shape(hwp, bold=False, size_pt=9)
            insert_text(hwp, cell)
            if j < cols - 1:
                hwp.HAction.Run("TableRightCell")

    # 표 밖으로 나오기
    hwp.HAction.Run("MoveNextParaEnd")
    blank_line(hwp, 1)


def main():
    print("HWP 결과보고서 양식 생성 중...")

    try:
        hwp = win32.gencache.EnsureDispatch("HWPFrame.HwpObject")
    except Exception as e:
        print(f"HWP 초기화 실패: {e}")
        sys.exit(1)

    try:
        hwp.RegisterModule("FilePathCheckDLL", "FilePathCheckerModule")
    except Exception:
        pass

    # 새 문서 생성
    hwp.HAction.Run("FileNew")

    # ────────────────────────────────────────────────────────────────────────
    # 표지
    # ────────────────────────────────────────────────────────────────────────
    blank_line(hwp, 5)

    set_para_shape(hwp, align=ALIGN_CENTER, prev_spacing=0, next_spacing=200)
    set_char_shape(hwp, bold=True, size_pt=20)
    insert_text(hwp, "타운홀 미팅 결과보고서")
    new_line(hwp)

    set_para_shape(hwp, align=ALIGN_CENTER)
    set_char_shape(hwp, bold=True, size_pt=12)
    insert_text(hwp, "지역사회보장협의체 동별 복지문제 발굴 및 해결방안 토론")
    new_line(hwp)

    blank_line(hwp, 3)

    set_para_shape(hwp, align=ALIGN_CENTER)
    set_char_shape(hwp, bold=False, size_pt=11)
    for line in [
        "동   명   칭  :              동",
        "보 고 일 자  :       년    월    일",
        "작  성  자  :                    (서명)",
        "검  토  자  :                    (서명)",
        "",
        "주      최  :  ○○구 지역사회보장협의체",
    ]:
        insert_text(hwp, line)
        new_line(hwp)

    blank_line(hwp, 4)

    set_para_shape(hwp, align=ALIGN_CENTER)
    set_char_shape(hwp, bold=False, size_pt=9)
    insert_text(hwp, "본 보고서는 지역사회보장협의체 우수 사업(동) 선정을 위한 결과발표회 제출용입니다.")
    new_line(hwp)

    hwp.HAction.Run("BreakPage")

    # ────────────────────────────────────────────────────────────────────────
    # 목차
    # ────────────────────────────────────────────────────────────────────────
    insert_heading(hwp, "[ 목  차 ]", level=2)
    set_char_shape(hwp, bold=False, size_pt=10)
    for item in [
        "1. 타운홀 미팅 개요",
        "2. 지역 복지문제 현황 파악",
        "3. 토론 결과 요약",
        "4. 특화사업 계획(안)",
        "5. 종합의견 및 우선순위",
        "",
        "【별첨 1】 참석자 명단",
        "【별첨 2】 회의록(요약)",
    ]:
        insert_text(hwp, "  " + item)
        new_line(hwp)

    hwp.HAction.Run("BreakPage")

    # ────────────────────────────────────────────────────────────────────────
    # 1. 타운홀 미팅 개요
    # ────────────────────────────────────────────────────────────────────────
    insert_heading(hwp, "1. 타운홀 미팅 개요", level=1)

    set_char_shape(hwp, bold=False, size_pt=10)
    set_para_shape(hwp, align=ALIGN_LEFT)
    for label in ["○ 일     시", "○ 장     소", "○ 주     최", "○ 진 행 자"]:
        insert_label_value(hwp, label)

    blank_line(hwp)
    insert_heading(hwp, "◇ 참석자 현황", level=3)
    create_table_and_fill(
        hwp,
        headers=["구     분", "인원(명)", "비     고"],
        rows_data=[
            ["지사협 위원", "", ""],
            ["주민 대표", "", ""],
            ["유관기관 담당자", "", ""],
            ["동 주민센터", "", ""],
            ["기      타", "", ""],
            ["합      계", "", ""],
        ],
        col_widths_mm=[60, 30, 55],
    )

    insert_heading(hwp, "◇ 주요 안건", level=3)
    set_char_shape(hwp, bold=False, size_pt=10)
    for i in range(1, 4):
        insert_text(hwp, f"  {i}. ")
        new_line(hwp)
    blank_line(hwp)

    # ────────────────────────────────────────────────────────────────────────
    # 2. 지역 복지문제 현황 파악
    # ────────────────────────────────────────────────────────────────────────
    insert_heading(hwp, "2. 지역 복지문제 현황 파악", level=1)
    set_char_shape(hwp, bold=False, size_pt=9)
    insert_text(hwp, "  ※ 타운홀 미팅에서 파악된 우리 동의 주요 복지 이슈를 기재하여 주십시오.")
    new_line(hwp)
    blank_line(hwp)

    create_table_and_fill(
        hwp,
        headers=["번호", "복지 문제 내용", "주요 대상", "심각도(상/중/하)", "우선순위"],
        rows_data=[
            ["1", "", "", "", ""],
            ["2", "", "", "", ""],
            ["3", "", "", "", ""],
            ["4", "", "", "", ""],
            ["5", "", "", "", ""],
        ],
        col_widths_mm=[12, 68, 28, 24, 13],
    )

    insert_heading(hwp, "◇ 복지 이슈 도출 배경 및 근거", level=3)
    set_char_shape(hwp, bold=False, size_pt=10)
    for _ in range(4):
        new_line(hwp)

    # ────────────────────────────────────────────────────────────────────────
    # 3. 토론 결과 요약
    # ────────────────────────────────────────────────────────────────────────
    insert_heading(hwp, "3. 토론 결과 요약", level=1)
    insert_heading(hwp, "◇ 주요 의견 요약", level=3)
    set_char_shape(hwp, bold=False, size_pt=9)
    insert_text(hwp, "  ※ 토론에서 나온 복지 해결방안, 주민 요구사항 등 핵심 의견을 요약 정리합니다.")
    new_line(hwp)
    blank_line(hwp)

    create_table_and_fill(
        hwp,
        headers=["번호", "주요 의견 내용", "제안자(역할)", "처리 방향"],
        rows_data=[
            ["1", "", "", ""],
            ["2", "", "", ""],
            ["3", "", "", ""],
            ["4", "", "", ""],
            ["5", "", "", ""],
        ],
        col_widths_mm=[12, 75, 28, 30],
    )

    insert_heading(hwp, "◇ 결론 및 합의사항", level=3)
    set_char_shape(hwp, bold=False, size_pt=10)
    for _ in range(5):
        new_line(hwp)

    # ────────────────────────────────────────────────────────────────────────
    # 4. 특화사업 계획(안)
    # ────────────────────────────────────────────────────────────────────────
    insert_heading(hwp, "4. 특화사업 계획(안)", level=1)
    set_char_shape(hwp, bold=False, size_pt=9)
    insert_text(hwp, "  ※ 토론에서 도출된 복지문제 해결을 위한 사업 계획을 우선순위 순으로 기재하여 주십시오.")
    new_line(hwp)
    blank_line(hwp)

    # 핵심 사업 요약 표
    create_table_and_fill(
        hwp,
        headers=["우선순위", "사  업  명", "대상주민", "예산(원/연간)", "운  영  내  용\n(방법·기간·횟수)", "기 대 효 과", "담당부서/협력기관"],
        rows_data=[
            ["1순위", "", "", "", "", "", ""],
            ["2순위", "", "", "", "", "", ""],
            ["3순위", "", "", "", "", "", ""],
        ],
        col_widths_mm=[15, 27, 14, 22, 33, 25, 19],
    )

    blank_line(hwp)
    insert_heading(hwp, "◇ 1순위 사업 상세 계획", level=2)

    set_char_shape(hwp, bold=False, size_pt=10)
    for label, val in [
        ("사  업  명", ""),
        ("사업 목적", ""),
        ("사업 기간", "      년    월    일  ~      년    월    일"),
        ("사업 장소", ""),
        ("사업 대상", "                명  / 선정기준:                "),
        ("총  예  산", "                원"),
        ("주요 내용", ""),
        ("추진 방법", ""),
        ("기대 효과", ""),
        ("협력기관", ""),
    ]:
        insert_label_value(hwp, "  ▷ " + label, val)

    blank_line(hwp)
    insert_heading(hwp, "◇ 예산 계획 (1순위 사업 기준)", level=3)
    create_table_and_fill(
        hwp,
        headers=["비   목", "산  출  내  역  (단가×수량×횟수)", "금액(원)", "비고"],
        rows_data=[
            ["인건비", "", "", ""],
            ["운영비", "", "", ""],
            ["재료비", "", "", ""],
            ["기  타", "", "", ""],
            ["합  계", "", "", ""],
        ],
        col_widths_mm=[22, 88, 25, 10],
    )

    # ────────────────────────────────────────────────────────────────────────
    # 5. 종합의견 및 우선순위
    # ────────────────────────────────────────────────────────────────────────
    insert_heading(hwp, "5. 종합의견 및 우선순위", level=1)
    insert_heading(hwp, "◇ 우선 추진 사업 및 선정 근거", level=3)
    set_char_shape(hwp, bold=False, size_pt=9)
    insert_text(hwp, "  ※ 우선 추진해야 할 사업과 선정 근거를 기재합니다.")
    new_line(hwp)
    blank_line(hwp)

    create_table_and_fill(
        hwp,
        headers=["순위", "사  업  명", "우선 선정 근거", "예상 파급효과"],
        rows_data=[
            ["1순위", "", "", ""],
            ["2순위", "", "", ""],
            ["3순위", "", "", ""],
        ],
        col_widths_mm=[14, 34, 65, 32],
    )

    insert_heading(hwp, "◇ 기타 의견 및 건의사항", level=3)
    set_char_shape(hwp, bold=False, size_pt=10)
    for _ in range(5):
        new_line(hwp)

    insert_heading(hwp, "◇ 동 지사협 위원 검토의견", level=3)
    set_char_shape(hwp, bold=False, size_pt=9)
    insert_text(hwp, "  ※ 결과발표회 전 위원들의 추가 검토·보완 의견을 기재합니다.")
    new_line(hwp)
    set_char_shape(hwp, bold=False, size_pt=10)
    for _ in range(5):
        new_line(hwp)

    # ────────────────────────────────────────────────────────────────────────
    # 별첨 1 – 참석자 명단
    # ────────────────────────────────────────────────────────────────────────
    hwp.HAction.Run("BreakPage")
    insert_heading(hwp, "【별첨 1】 참석자 명단", level=1)
    create_table_and_fill(
        hwp,
        headers=["번호", "성     명", "소속 / 역할", "연  락  처", "서   명"],
        rows_data=[[str(i), "", "", "", ""] for i in range(1, 16)],
        col_widths_mm=[12, 24, 55, 38, 16],
    )

    # ────────────────────────────────────────────────────────────────────────
    # 별첨 2 – 회의록 요약
    # ────────────────────────────────────────────────────────────────────────
    blank_line(hwp)
    insert_heading(hwp, "【별첨 2】 회의록(요약)", level=1)
    set_char_shape(hwp, bold=False, size_pt=9)
    insert_text(hwp, "  ※ 타운홀 미팅 진행 순서와 주요 발언을 시간 순서대로 기록합니다.")
    new_line(hwp)
    blank_line(hwp)

    create_table_and_fill(
        hwp,
        headers=["시   간", "진  행  내  용", "주요 발언 및 내용 요약", "비고"],
        rows_data=[
            [":  ~  :", "개회 및 인사말", "", ""],
            [":  ~  :", "지역 현황 설명", "", ""],
            [":  ~  :", "복지문제 발표", "", ""],
            [":  ~  :", "분임 토론", "", ""],
            [":  ~  :", "전체 토론", "", ""],
            [":  ~  :", "결과 정리 및 마무리", "", ""],
            [":  ~  :", "", "", ""],
        ],
        col_widths_mm=[22, 30, 85, 8],
    )

    # ────────────────────────────────────────────────────────────────────────
    # 저장
    # ────────────────────────────────────────────────────────────────────────
    print(f"저장 중: {OUTPUT_PATH}")
    try:
        hwp.SaveAs(OUTPUT_PATH, "HWPX", "")
        print("저장 완료: " + OUTPUT_PATH)
    except Exception as e:
        print("HWPX 저장 오류: " + str(e))
        alt_path = OUTPUT_PATH.replace(".hwpx", ".hwp")
        try:
            hwp.SaveAs(alt_path, "HWP", "")
            print("HWP 형식으로 저장: " + alt_path)
        except Exception as e2:
            print("저장 실패: " + str(e2))

    # 창 표시
    try:
        hwp.XHwpWindows.Active_XHwpWindow.Visible = True
    except Exception:
        pass

    print("완료!")


if __name__ == "__main__":
    main()

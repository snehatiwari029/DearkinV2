import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import { CalculationResult } from "@/lib/pfml/types";

const C = {
  terracotta: "#C1694F",
  terracottaLight: "#F5E6E0",
  cream: "#F0EBE3",
  ink: "#2D2D2D",
  inkMid: "#6B6B6B",
  inkLight: "#9A9A9A",
  sage: "#4A7C6F",
  sageLight: "#E0EDEB",
  parchment: "#FAF8F4",
  white: "#FFFFFF",
  red: "#B91C1C",
  redLight: "#FEF2F2",
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: C.parchment,
    paddingHorizontal: 40,
    paddingVertical: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: C.ink,
  },
  header: {
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.cream,
  },
  eyebrow: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: C.terracotta,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: C.ink,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    color: C.inkMid,
  },
  section: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: C.inkMid,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  card: {
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.cream,
    borderRadius: 8,
    padding: 12,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  cardLabel: {
    fontSize: 10,
    color: C.inkMid,
  },
  cardValue: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: C.ink,
  },
  cardValueAccent: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: C.terracotta,
  },
  cardValueSage: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: C.sage,
  },
  heroGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  heroCard: {
    flex: 1,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.cream,
    borderRadius: 8,
    padding: 12,
  },
  heroNumber: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: C.terracotta,
    marginBottom: 2,
  },
  heroNumberInk: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: C.ink,
    marginBottom: 2,
  },
  heroLabel: {
    fontSize: 8,
    color: C.inkMid,
  },
  gapBanner: {
    backgroundColor: C.redLight,
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  gapTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: C.red,
    marginBottom: 4,
  },
  gapAmount: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: C.red,
    marginBottom: 2,
  },
  noGapBanner: {
    backgroundColor: C.sageLight,
    borderWidth: 1,
    borderColor: "#A7C4BE",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  noGapText: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: C.sage,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: C.cream,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  tableHeaderCell: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: C.inkMid,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: C.cream,
  },
  tableRowAlt: {
    backgroundColor: C.white,
  },
  tableCell: {
    fontSize: 9,
    color: C.ink,
  },
  tableCellSage: {
    fontSize: 9,
    color: C.sage,
    fontFamily: "Helvetica-Bold",
  },
  tableCellRed: {
    fontSize: 9,
    color: C.red,
    fontFamily: "Helvetica-Bold",
  },
  col0: { width: "8%" },
  col1: { width: "18%" },
  col2: { width: "18%" },
  col3: { width: "18%" },
  col4: { width: "18%" },
  col5: { width: "20%" },
  footer: {
    marginTop: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: C.cream,
  },
  footerText: {
    fontSize: 8,
    color: C.inkLight,
    textAlign: "center",
    lineHeight: 1.5,
  },
});

function fmt(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

interface LeavePlanPDFProps {
  result: CalculationResult;
  email?: string;
}

export function LeavePlanPDF({ result, email }: LeavePlanPDFProps) {
  const hasGap = result.totalIncomeGap > 0;
  const generatedDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Document
      title="Dearkin Leave Income Plan"
      author="Dearkin"
      subject="WA PFML Leave Income Breakdown"
    >
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Dearkin · Washington State</Text>
          <Text style={styles.title}>Leave Income Plan</Text>
          <Text style={styles.subtitle}>
            Generated {generatedDate}
            {email ? ` · ${email}` : ""}
          </Text>
        </View>

        {/* Hero numbers */}
        <View style={styles.heroGrid}>
          <View style={styles.heroCard}>
            <Text style={styles.heroNumber}>{fmt(result.weeklyBenefit)}</Text>
            <Text style={styles.heroLabel}>Weekly PFML Benefit</Text>
          </View>
          <View style={styles.heroCard}>
            <Text style={styles.heroNumberInk}>
              {result.totalLeaveWeeks} wks
            </Text>
            <Text style={styles.heroLabel}>Total Leave Duration</Text>
          </View>
          <View style={styles.heroCard}>
            <Text style={styles.heroNumber}>{fmt(result.fullSalaryWeekly)}</Text>
            <Text style={styles.heroLabel}>Full Salary (weekly)</Text>
          </View>
        </View>

        {/* Gap / No-gap banner */}
        {hasGap ? (
          <View style={styles.gapBanner}>
            <Text style={styles.gapTitle}>Income Gap Detected</Text>
            <Text style={styles.gapAmount}>{fmt(result.totalIncomeGap)} total</Text>
            <Text style={{ fontSize: 9, color: C.red }}>
              {result.timeline.filter((w) => w.gap > 0).length} weeks below
              full salary during leave
            </Text>
          </View>
        ) : (
          <View style={styles.noGapBanner}>
            <Text style={styles.noGapText}>
              ✓ No income gap — employer top-up covers your full salary
            </Text>
          </View>
        )}

        {/* Employer policy */}
        {result.employer.topUpWeeks > 0 && (
          <View style={[styles.section]}>
            <Text style={styles.sectionLabel}>
              {result.employer.name} Leave Policy
            </Text>
            <View style={styles.card}>
              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>Top-up weeks</Text>
                <Text style={styles.cardValue}>
                  {result.employer.topUpWeeks} weeks
                </Text>
              </View>
              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>Top-up percentage</Text>
                <Text style={styles.cardValue}>
                  {result.employer.topUpPercent}% of salary
                </Text>
              </View>
              {result.employer.stdWeeks > 0 && (
                <View style={styles.cardRow}>
                  <Text style={styles.cardLabel}>STD weeks</Text>
                  <Text style={styles.cardValue}>
                    {result.employer.stdWeeks} weeks
                  </Text>
                </View>
              )}
              <Text style={{ fontSize: 8, color: C.inkLight, marginTop: 6 }}>
                Policies change — verify with HR
              </Text>
            </View>
          </View>
        )}

        {/* Income summary */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Income Summary</Text>
          <View style={styles.card}>
            <View style={styles.cardRow}>
              <Text style={styles.cardLabel}>Total PFML income</Text>
              <Text style={styles.cardValueAccent}>
                {fmt(result.totalPFMLIncome)}
              </Text>
            </View>
            {result.totalEmployerTopUp > 0 && (
              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>Total employer top-up</Text>
                <Text style={styles.cardValueSage}>
                  {fmt(result.totalEmployerTopUp)}
                </Text>
              </View>
            )}
            {result.totalSTDIncome > 0 && (
              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>Total STD income</Text>
                <Text style={styles.cardValue}>
                  {fmt(result.totalSTDIncome)}
                </Text>
              </View>
            )}
            <View
              style={[
                styles.cardRow,
                {
                  borderTopWidth: 1,
                  borderTopColor: C.cream,
                  marginTop: 4,
                  paddingTop: 6,
                },
              ]}
            >
              <Text style={styles.cardLabel}>Total income during leave</Text>
              <Text style={styles.cardValue}>{fmt(result.totalIncome)}</Text>
            </View>
            {hasGap && (
              <View style={styles.cardRow}>
                <Text style={[styles.cardLabel, { color: C.red }]}>
                  Total income gap
                </Text>
                <Text style={[styles.cardValue, { color: C.red }]}>
                  {fmt(result.totalIncomeGap)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Week-by-week timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Week-by-Week Timeline</Text>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.col0]}>Wk</Text>
            <Text style={[styles.tableHeaderCell, styles.col1]}>PFML</Text>
            <Text style={[styles.tableHeaderCell, styles.col2]}>
              Employer
            </Text>
            <Text style={[styles.tableHeaderCell, styles.col3]}>STD</Text>
            <Text style={[styles.tableHeaderCell, styles.col4]}>Total</Text>
            <Text style={[styles.tableHeaderCell, styles.col5]}>Gap</Text>
          </View>
          {result.timeline.map((w, i) => (
            <View
              key={w.week}
              style={[styles.tableRow, i % 2 === 0 ? styles.tableRowAlt : {}]}
            >
              <Text style={[styles.tableCell, styles.col0]}>{w.week}</Text>
              <Text style={[styles.tableCell, styles.col1]}>
                {w.pfmlBenefit > 0 ? fmt(w.pfmlBenefit) : "—"}
              </Text>
              <Text style={[styles.tableCell, styles.col2]}>
                {w.employerTopUp > 0 ? fmt(w.employerTopUp) : "—"}
              </Text>
              <Text style={[styles.tableCell, styles.col3]}>
                {w.stdBenefit > 0 ? fmt(w.stdBenefit) : "—"}
              </Text>
              <Text style={[styles.tableCellSage, styles.col4]}>
                {fmt(w.totalIncome)}
              </Text>
              <Text
                style={[
                  w.gap > 0 ? styles.tableCellRed : styles.tableCell,
                  styles.col5,
                ]}
              >
                {w.gap > 0 ? fmt(w.gap) : "✓ $0"}
              </Text>
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Not legal or financial advice. Results are estimates based on 2026
            WA PFML rates.{"\n"}
            Verify benefit amounts with the WA Employment Security Department
            and your HR team.{"\n"}
            Generated by Dearkin · dearkin.com
          </Text>
        </View>
      </Page>
    </Document>
  );
}

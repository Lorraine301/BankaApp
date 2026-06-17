import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';

// Icône selon le type de compte
const TYPE_ICONS = {
  courant:       '💳',
  epargne:       '🏦',
  professionnel: '💼',
};

export default function AccountCard({ account, onPress }) {
  const isPositive = account.balance > 0;
  const isLowBalance = account.balance < 1000 && account.balance >= 0;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isLowBalance && styles.cardWarning,
      ]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      {/* En-tête : icône + label */}
      <View style={styles.header}>
        <Text style={styles.icon}>{TYPE_ICONS[account.type] || '🏦'}</Text>
        <View style={styles.headerText}>
          <Text style={styles.label}>{account.label}</Text>
          <Text style={styles.iban}>{account.iban}</Text>
        </View>
        {/* Indicateur solde faible */}
        {isLowBalance && (
          <View style={styles.warningBadge}>
            <Text style={styles.warningBadgeText}>⚠️</Text>
          </View>
        )}
      </View>

      {/* Séparateur */}
      <View style={styles.divider} />

      {/* Solde */}
      <View style={styles.balanceRow}>
        <Text style={styles.balanceLabel}>Solde disponible</Text>
        <Text style={[
          styles.balance,
          { color: isLowBalance ? colors.warning : (isPositive ? colors.success : colors.danger) }
        ]}>
          {account.balance.toLocaleString('fr-FR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })} MAD
        </Text>
      </View>

      {/* Footer : nombre de transactions */}
      <Text style={styles.txCount}>
        {account.transactions.length} opération(s) enregistrée(s)
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius:    16,
    padding:         20,
    marginHorizontal:16,
    marginVertical:  8,
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 3 },
    shadowOpacity:   0.10,
    shadowRadius:    6,
    elevation:       4,
    borderLeftWidth: 5,
    borderLeftColor: colors.primary,
  },
  cardWarning: {
    borderLeftColor: colors.warning,
  },
  header: {
    flexDirection:  'row',
    alignItems:     'center',
    marginBottom:   12,
  },
  icon: {
    fontSize: 28,
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  label: {
    fontSize:   17,
    fontWeight: '700',
    color:      colors.text,
  },
  iban: {
    fontSize: 11,
    color:    colors.textLight,
    marginTop: 2,
  },
  warningBadge: {
    backgroundColor: colors.warning + '20',
    borderRadius:    20,
    paddingHorizontal: 6,
    paddingVertical:   2,
  },
  warningBadgeText: {
    fontSize: 16,
  },
  divider: {
    height:          1,
    backgroundColor: colors.border,
    marginBottom:    12,
  },
  balanceRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
  },
  balanceLabel: {
    fontSize: 13,
    color:    colors.textLight,
  },
  balance: {
    fontSize:   20,
    fontWeight: '800',
  },
  txCount: {
    fontSize:  11,
    color:     colors.textLight,
    marginTop: 10,
    textAlign: 'right',
  },
});

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

const TYPE_CONFIG = {
  credit:            { label: 'Crédit',        color: colors.success, sign: '+', icon: '↑' },
  debit:             { label: 'Débit',          color: colors.danger,  sign: '-', icon: '↓' },
  virement_entrant:  { label: 'Virement reçu', color: colors.success, sign: '+', icon: '↗' },
  virement_sortant:  { label: 'Virement émis', color: colors.danger,  sign: '-', icon: '↙' },
};

export default function TransactionItem({ transaction }) {
  const config = TYPE_CONFIG[transaction.type] || TYPE_CONFIG.credit;

  return (
    <View style={styles.row}>
      {/* Indicateur de type */}
      <View style={[styles.iconBox, { backgroundColor: config.color + '20' }]}>
        <Text style={[styles.icon, { color: config.color }]}>{config.icon}</Text>
      </View>

      {/* Infos */}
      <View style={styles.info}>
        <Text style={styles.label} numberOfLines={1}>{transaction.label}</Text>
        <Text style={styles.meta}>{config.label} • {transaction.date}</Text>
      </View>

      {/* Montant */}
      <Text style={[styles.amount, { color: config.color }]}>
        {config.sign}{transaction.amount.toLocaleString('fr-FR')} MAD
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection:   'row',
    alignItems:      'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.card,
  },
  iconBox: {
    width:        40,
    height:       40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems:     'center',
    marginRight:    12,
  },
  icon:   { fontSize: 18, fontWeight: '700' },
  info:   { flex: 1 },
  label:  { fontSize: 14, fontWeight: '600', color: colors.text },
  meta:   { fontSize: 12, color: colors.textLight, marginTop: 2 },
  amount: { fontSize: 14, fontWeight: '700' },
});

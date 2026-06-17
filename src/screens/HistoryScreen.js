import React from 'react';
import { View, FlatList, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import TransactionItem from '../components/TransactionItem';

/**
 * Tâche 4 — Tri chronologique réel
 * Parse une date au format DD/MM/YYYY et retourne un timestamp
 */
function parseDate(dateStr) {
  if (!dateStr) return 0;
  const parts = dateStr.split('/');
  if (parts.length !== 3) return 0;
  const [day, month, year] = parts;
  // new Date(year, month - 1, day) → timestamp fiable
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).getTime();
}

export default function HistoryScreen({ accounts }) {
  // Agréger toutes les transactions de tous les comptes
  const allTransactions = accounts
    .flatMap(acc =>
      acc.transactions.map(tx => ({
        ...tx,
        accountLabel: acc.label,
        uniqueKey:    acc.id + '-' + tx.id,
      }))
    )
    // Tâche 4 — Tri chronologique décroissant (du plus récent au plus ancien)
    .sort((a, b) => parseDate(b.date) - parseDate(a.date));

  return (
    <View style={styles.container}>
      {allTransactions.length === 0 ? (
        <Text style={styles.empty}>Aucune opération dans l'historique.</Text>
      ) : (
        <FlatList
          data={allTransactions}
          keyExtractor={(item) => item.uniqueKey}
          renderItem={({ item }) => (
            <View>
              <Text style={styles.accountTag}>{item.accountLabel}</Text>
              <TransactionItem transaction={item} />
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: colors.background },
  accountTag: {
    fontSize:          11,
    color:             colors.textLight,
    paddingHorizontal: 16,
    paddingTop:        10,
    paddingBottom:     2,
    textTransform:     'uppercase',
    letterSpacing:     0.6,
    fontWeight:        '600',
  },
  empty: { padding: 30, textAlign: 'center', color: colors.textLight },
});

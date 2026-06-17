import React from 'react';
import { View, FlatList, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { colors } from '../theme/colors';
import AccountCard from '../components/AccountCard';
import { initialAccounts } from '../data/accounts';

export default function DashboardScreen({ navigation, accounts, onReset }) {
  // Calcul du solde total
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  // Tâche 5 (Bonus) — Réinitialisation
  const handleReset = () => {
    Alert.alert(
      'Réinitialiser la session',
      'Tous les comptes seront remis à leur état initial. Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Réinitialiser',
          style: 'destructive',
          onPress: () => onReset && onReset(),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Bandeau solde total */}
      <View style={styles.totalBanner}>
        <Text style={styles.totalLabel}>Patrimoine Total</Text>
        <Text style={styles.totalAmount}>
          {totalBalance.toLocaleString('fr-FR', {
            minimumFractionDigits: 2,
          })} MAD
        </Text>
        <Text style={styles.totalSub}>{accounts.length} compte(s) actif(s)</Text>
      </View>

      {/* Liste des comptes */}
      <FlatList
        data={accounts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AccountCard
            account={item}
            onPress={() =>
              navigation.navigate('AccountDetail', { accountId: item.id })
            }
          />
        )}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <Text style={styles.sectionTitle}>Sélectionnez un compte</Text>
        }
        ListFooterComponent={
          /* Tâche 5 (Bonus) — Bouton Réinitialiser */
          onReset ? (
            <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
              <Text style={styles.resetBtnText}>🔄 Réinitialiser la session</Text>
            </TouchableOpacity>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: colors.background },
  totalBanner: {
    backgroundColor: colors.primary,
    padding:         24,
    alignItems:      'center',
  },
  totalLabel:  { color: 'rgba(255,255,255,0.75)', fontSize: 13 },
  totalAmount: { color: '#fff', fontSize: 32, fontWeight: '800', marginVertical: 4 },
  totalSub:    { color: 'rgba(255,255,255,0.6)', fontSize: 12 },
  list:        { paddingBottom: 24 },
  sectionTitle:{
    fontSize:       13,
    color:          colors.textLight,
    paddingHorizontal: 16,
    paddingVertical:   12,
    textTransform:  'uppercase',
    letterSpacing:  0.8,
  },
  resetBtn: {
    marginHorizontal: 16,
    marginTop:        16,
    marginBottom:     8,
    paddingVertical:  14,
    borderRadius:     10,
    backgroundColor:  colors.textLight + '20',
    alignItems:       'center',
    borderWidth:      1,
    borderColor:      colors.border,
  },
  resetBtnText: {
    fontSize:   14,
    color:      colors.textLight,
    fontWeight: '600',
  },
});

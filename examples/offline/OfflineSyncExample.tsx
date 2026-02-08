import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, StyleSheet, Alert } from 'react-native';
import { useOfflineSync } from '../../src/offline/useOfflineSync';
import { HttpMethod } from '../../src/infrastructure/network/HttpMethod';
import { ConnectivityManager } from '../../src/infrastructure/connectivity/ConnectivityManager';

interface Order {
    id: string;
    product: string;
    quantity: number;
    timestamp: number;
}

export const OfflineSyncExample: React.FC = () => {
    const {
        isOnline,
        isSyncing,
        pendingCount,
        enqueue,
        sync,
        clearQueue
    } = useOfflineSync();

    const [orders, setOrders] = useState<Order[]>([]);

    // Function to simulate creating an order
    const createOrder = async () => {
        const newOrder: Order = {
            id: Date.now().toString(),
            product: `Product ${Math.floor(Math.random() * 100)}`,
            quantity: 1,
            timestamp: Date.now()
        };

        // Add to local state immediately (optimistic UI)
        setOrders(prev => [newOrder, ...prev]);

        try {
            // Queue the request
            await enqueue({
                method: HttpMethod.POST,
                url: '/orders',
                data: newOrder,
                priority: 'normal'
            });

            Alert.alert('Success', isOnline ? 'Order sent!' : 'Order queued for offline sync');
        } catch (error) {
            Alert.alert('Error', 'Failed to queue order');
            // Revert optimistic update if needed
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Offline Sync Example</Text>
                <View style={[styles.badge, isOnline ? styles.online : styles.offline]}>
                    <Text style={styles.badgeText}>{isOnline ? 'ONLINE' : 'OFFLINE'}</Text>
                </View>
            </View>

            <View style={styles.statusPanel}>
                <Text>Status: {isSyncing ? 'Syncing...' : 'Idle'}</Text>
                <Text>Pending Requests: {pendingCount}</Text>
                <Button title="Force Sync" onPress={() => sync()} disabled={!isOnline || isSyncing} />
                <Button title="Clear Queue" onPress={clearQueue} color="red" />
            </View>

            <View style={styles.actions}>
                <Button title="Create Order" onPress={createOrder} />
            </View>

            <Text style={styles.subtitle}>Local Orders Log:</Text>
            <FlatList
                data={orders}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <View style={styles.item}>
                        <Text>{item.product} (x{item.quantity})</Text>
                        <Text style={styles.timestamp}>{new Date(item.timestamp).toLocaleTimeString()}</Text>
                    </View>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
    },
    online: {
        backgroundColor: '#e6ffe6',
    },
    offline: {
        backgroundColor: '#ffe6e6',
    },
    badgeText: {
        fontWeight: 'bold',
        fontSize: 12,
    },
    statusPanel: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
        gap: 10,
    },
    actions: {
        marginBottom: 20,
    },
    subtitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    item: {
        backgroundColor: 'white',
        padding: 15,
        marginBottom: 10,
        borderRadius: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    timestamp: {
        color: '#666',
        fontSize: 12,
    },
});

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { Message } from '../types';
import { useAuth } from '../context/AuthContext';
import { useMessages } from '../context/MessagesContext';
import { apiService } from '../services/apiService';
import { socketService } from '../services/socketService';
import { theme } from '../constants/theme';

interface ChatScreenProps {
  navigation: any;
  route: {
    params: {
      conversationId: string;
    };
  };
}

// Message Bubble Component
const MessageBubble = ({ message, isOwnMessage }: { message: Message; isOwnMessage: boolean }) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const handlePlayAudio = async () => {
    if (!message.audioUrl) return;

    try {
      if (isPlaying && sound) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else if (sound) {
        await sound.playAsync();
        setIsPlaying(true);
      } else {
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: message.audioUrl },
          { shouldPlay: true },
          (status) => {
            if (status.isLoaded && status.didJustFinish) {
              setIsPlaying(false);
            }
          }
        );
        setSound(newSound);
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Audio playback error:', error);
      Alert.alert('Erreur', 'Impossible de lire le message vocal');
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={[styles.messageBubbleContainer, isOwnMessage && styles.ownMessageContainer]}>
      <View
        style={[
          styles.messageBubble,
          isOwnMessage ? styles.ownMessageBubble : styles.otherMessageBubble,
        ]}
      >
        {message.type === 'text' ? (
          <Text
            style={[
              styles.messageText,
              isOwnMessage ? styles.ownMessageText : styles.otherMessageText,
            ]}
          >
            {message.content}
          </Text>
        ) : (
          <TouchableOpacity onPress={handlePlayAudio} style={styles.audioMessage}>
            <View
              style={[
                styles.audioIcon,
                isOwnMessage ? styles.ownAudioIcon : styles.otherAudioIcon,
              ]}
            >
              <Text style={styles.audioIconText}>{isPlaying ? '⏸' : '▶️'}</Text>
            </View>
            <Text
              style={[
                styles.audioDuration,
                isOwnMessage ? styles.ownMessageText : styles.otherMessageText,
              ]}
            >
              {formatDuration(message.audioDuration)}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.messageTime}>
        {new Date(message.createdAt).toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </Text>
    </View>
  );
};

// Typing Indicator Component
const TypingIndicator = () => {
  return (
    <View style={styles.typingContainer}>
      <View style={styles.typingBubble}>
        <View style={styles.typingDots}>
          <View style={[styles.typingDot, styles.typingDot1]} />
          <View style={[styles.typingDot, styles.typingDot2]} />
          <View style={[styles.typingDot, styles.typingDot3]} />
        </View>
      </View>
    </View>
  );
};

// Main Chat Screen
export const ChatScreen = ({ navigation, route }: ChatScreenProps) => {
  const { conversationId } = route.params;
  const { creator } = useAuth();
  const { getConversation } = useMessages();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);

  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const conversation = getConversation(conversationId);

  useEffect(() => {
    // Connecter le socket si nécessaire
    const initSocket = async () => {
      try {
        if (!socketService.isConnected()) {
          console.log('[ChatScreen] Connecting socket...');
          await socketService.connect();
        }
        socketService.joinConversation(conversationId);
      } catch (error) {
        console.error('[ChatScreen] Socket connection error:', error);
      }
    };

    loadMessages();
    setupSocketListeners();
    initSocket();

    // Request audio permissions
    requestAudioPermissions();

    return () => {
      socketService.leaveConversation(conversationId);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [conversationId]);

  const requestAudioPermissions = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
    } catch (error) {
      console.error('Audio permissions error:', error);
    }
  };

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      const data = await apiService.getConversationMessages(conversationId);
      setMessages(data.reverse()); // Most recent at bottom
    } catch (error) {
      console.error('Load messages error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setupSocketListeners = () => {
    const unsubscribeNewMessage = socketService.onNewMessage((message: Message) => {
      if (message.conversationId === conversationId) {
        setMessages((prev) => [...prev, message]);
        scrollToBottom();

        // Mark as read if not from us
        if (message.senderType !== 'creator') {
          socketService.markAsRead(message.id);
        }
      }
    });

    const unsubscribeTyping = socketService.onTyping((data) => {
      if (data.conversationId === conversationId && data.userId !== creator?.id) {
        setIsOtherTyping(true);
      }
    });

    const unsubscribeTypingStopped = socketService.onTypingStopped((data) => {
      if (data.conversationId === conversationId) {
        setIsOtherTyping(false);
      }
    });

    return () => {
      unsubscribeNewMessage();
      unsubscribeTyping();
      unsubscribeTypingStopped();
    };
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleInputChange = (text: string) => {
    setInputText(text);

    // Notify typing
    if (text.length > 0) {
      socketService.startTyping(conversationId);

      // Auto-stop typing after 3 seconds
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        socketService.stopTyping(conversationId);
      }, 3000);
    } else {
      socketService.stopTyping(conversationId);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  const handleSendText = async () => {
    if (!inputText.trim() || !creator) return;

    const tempId = `temp_${Date.now()}`;
    const newMessage: Message = {
      id: tempId,
      conversationId,
      senderId: creator.id,
      senderType: 'creator',
      content: inputText.trim(),
      type: 'text',
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputText('');
    socketService.stopTyping(conversationId);
    scrollToBottom();

    try {
      setIsSending(true);
      await apiService.sendMessage(conversationId, {
        conversationId,
        senderId: creator.id,
        senderType: 'creator',
        content: inputText.trim(),
        type: 'text',
      });
    } catch (error) {
      console.error('Send message error:', error);
      Alert.alert('Erreur', 'Impossible d\'envoyer le message');
      // Remove temp message
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    } finally {
      setIsSending(false);
    }
  };

  const handleStartRecording = async () => {
    try {
      const { granted } = await Audio.getPermissionsAsync();
      if (!granted) {
        Alert.alert('Permission requise', 'Permission d\'enregistrement audio requise');
        return;
      }

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(newRecording);
      setIsRecording(true);
    } catch (error) {
      console.error('Start recording error:', error);
      Alert.alert('Erreur', 'Impossible de démarrer l\'enregistrement');
    }
  };

  const handleStopRecording = async () => {
    if (!recording || !creator) return;

    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      if (!uri) {
        Alert.alert('Erreur', 'Enregistrement invalide');
        return;
      }

      // Get duration
      const status = await recording.getStatusAsync();
      const duration = status.durationMillis ? status.durationMillis / 1000 : 0;

      // Upload audio
      setIsSending(true);
      const { url: audioUrl } = await apiService.uploadAudio(uri);

      // Send audio message
      await apiService.sendMessage(conversationId, {
        conversationId,
        senderId: creator.id,
        senderType: 'creator',
        audioUrl,
        audioDuration: duration,
        type: 'audio',
      });

      setRecording(null);
    } catch (error) {
      console.error('Stop recording error:', error);
      Alert.alert('Erreur', 'Impossible d\'envoyer le message vocal');
    } finally {
      setIsSending(false);
    }
  };

  const handleCancelRecording = async () => {
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      setRecording(null);
      setIsRecording(false);
    } catch (error) {
      console.error('Cancel recording error:', error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          {conversation?.client.profileImage ? (
            <Image
              source={{ uri: conversation.client.profileImage }}
              style={styles.headerPhoto}
            />
          ) : (
            <View style={[styles.headerPhoto, styles.headerPhotoPlaceholder]}>
              <Text style={styles.headerPhotoText}>
                {conversation?.client.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View style={styles.headerText}>
            <Text style={styles.headerName}>{conversation?.client.name}</Text>
            {conversation?.project && (
              <Text style={styles.headerProject} numberOfLines={1}>
                {conversation.project.productName || conversation.project.title}
              </Text>
            )}
          </View>
        </View>
      </LinearGradient>

      {/* Messages List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MessageBubble message={item} isOwnMessage={item.senderType === 'creator'} />
          )}
          contentContainerStyle={styles.messagesContainer}
          onContentSizeChange={scrollToBottom}
          ListFooterComponent={isOtherTyping ? <TypingIndicator /> : null}
        />
      )}

      {/* Input Bar */}
      <View style={styles.inputContainer}>
        {isRecording ? (
          <View style={styles.recordingContainer}>
            <View style={styles.recordingIndicator}>
              <View style={styles.recordingDot} />
              <Text style={styles.recordingText}>Enregistrement...</Text>
            </View>
            <TouchableOpacity onPress={handleCancelRecording} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>✕</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleStopRecording} style={styles.sendRecordingButton}>
              <Text style={styles.sendRecordingIcon}>✓</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <TextInput
              style={styles.input}
              placeholder="Message..."
              placeholderTextColor={theme.colors.textLight}
              value={inputText}
              onChangeText={handleInputChange}
              multiline
              maxLength={1000}
            />

            {inputText.trim().length > 0 ? (
              <TouchableOpacity
                onPress={handleSendText}
                disabled={isSending}
                style={styles.sendButton}
              >
                <LinearGradient
                  colors={[theme.colors.primary, theme.colors.secondary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.sendButtonGradient}
                >
                  {isSending ? (
                    <ActivityIndicator size="small" color={theme.colors.card} />
                  ) : (
                    <Text style={styles.sendIcon}>➤</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={handleStartRecording}
                style={styles.micButton}
              >
                <Text style={styles.micIcon}>🎤</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  backIcon: {
    fontSize: 24,
    color: theme.colors.card,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: theme.spacing.sm,
  },
  headerPhotoPlaceholder: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerPhotoText: {
    color: theme.colors.card,
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerText: {
    flex: 1,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.card,
  },
  headerProject: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesContainer: {
    padding: theme.spacing.md,
  },
  messageBubbleContainer: {
    marginBottom: theme.spacing.md,
    alignItems: 'flex-start',
  },
  ownMessageContainer: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.radiusLg,
  },
  ownMessageBubble: {
    backgroundColor: theme.colors.primary,
  },
  otherMessageBubble: {
    backgroundColor: theme.colors.card,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  ownMessageText: {
    color: theme.colors.card,
  },
  otherMessageText: {
    color: theme.colors.textPrimary,
  },
  messageTime: {
    fontSize: 11,
    color: theme.colors.textLight,
    marginTop: theme.spacing.xs,
  },
  audioMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  audioIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ownAudioIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  otherAudioIcon: {
    backgroundColor: theme.colors.background,
  },
  audioIconText: {
    fontSize: 14,
  },
  audioDuration: {
    fontSize: 14,
    fontWeight: '500',
  },
  typingContainer: {
    marginBottom: theme.spacing.md,
    alignItems: 'flex-start',
  },
  typingBubble: {
    backgroundColor: theme.colors.card,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.radiusLg,
  },
  typingDots: {
    flexDirection: 'row',
    gap: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.textLight,
  },
  typingDot1: {
    opacity: 0.4,
  },
  typingDot2: {
    opacity: 0.7,
  },
  typingDot3: {
    opacity: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.card,
    borderTopWidth: 1,
    borderTopColor: theme.colors.background,
    gap: theme.spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.radiusXl,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: 15,
    color: theme.colors.textPrimary,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
  },
  sendButtonGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendIcon: {
    fontSize: 20,
    color: theme.colors.card,
  },
  micButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  micIcon: {
    fontSize: 24,
  },
  recordingContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  recordingIndicator: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.danger,
  },
  recordingText: {
    fontSize: 15,
    color: theme.colors.danger,
    fontWeight: '500',
  },
  cancelButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 24,
    color: theme.colors.textPrimary,
  },
  sendRecordingButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendRecordingIcon: {
    fontSize: 24,
    color: theme.colors.card,
    fontWeight: 'bold',
  },
});

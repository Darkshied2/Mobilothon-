import tensorflow as tf
import numpy as np

def train_model(data):
    x_train = np.array(data['x_train'])
    y_train = np.array(data['y_train'])

    model = tf.keras.Sequential([
        tf.keras.layers.Dense(64, activation='relu'),
        tf.keras.layers.Dense(10, activation='softmax')
    ])

    model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])
    model.fit(x_train, y_train, epochs=5)
    loss, accuracy = model.evaluate(x_train, y_train)
    return loss, accuracy
